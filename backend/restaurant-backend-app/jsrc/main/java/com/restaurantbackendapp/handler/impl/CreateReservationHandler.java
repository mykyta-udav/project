package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.ReservationRequestDto;
import com.restaurantbackendapp.dto.ReservationResponseDto;
import com.restaurantbackendapp.exception.InvalidRequestException;
import com.restaurantbackendapp.exception.ReservationConflictException;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.model.Reservation;
import com.restaurantbackendapp.repository.ReservationRepository;
import org.apache.commons.lang3.StringUtils;

import javax.inject.Inject;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.UUID;

/**
 * Handles requests to create new restaurant table reservations.
 * This handler processes reservation requests, validates the data, and stores reservations in DynamoDB.
 */
public class CreateReservationHandler implements EndpointHandler {
    private static final String ERROR = "Error: ";
    private static final String CONFIRMED = "CONFIRMED";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ReservationRepository repository;
    private final Gson gson;

    @Inject
    public CreateReservationHandler(ReservationRepository repository, Gson gson) {
        this.repository = repository;
        this.gson = gson;
    }

    /**
     * Handles the API Gateway request to create a new reservation.
     * Processes the request body, validates the reservation data, and creates the reservation.
     *
     * @param requestEvent The API Gateway request event containing the reservation request
     * @param context The Lambda execution context
     * @return APIGatewayProxyResponseEvent with status code 200 and reservation details on success,
     *         400 for invalid request data, 409 for conflicts, or 500 for server errors
     */
    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        try {
            context.getLogger().log("Processing reservation request");

            ReservationRequestDto reservationRequest = parseReservationRequest(requestEvent.getBody());
            validateReservationRequest(reservationRequest);

            boolean isTableAvailable = repository.isTableAvailable(
                    reservationRequest.getLocationId(),
                    reservationRequest.getTableNumber(),
                    reservationRequest.getDate(),
                    reservationRequest.getTimeFrom(),
                    reservationRequest.getTimeTo(),
                    context
            );

            if (!isTableAvailable) {
                throw new ReservationConflictException("Table is not available for the requested time slot");
            }

            Reservation reservation = buildReservation(reservationRequest);
            repository.createReservation(reservation, context);

            String locationAddress = repository.fetchLocationAddressById(reservationRequest.getLocationId(), context);

            ReservationResponseDto response = buildReservationResponse(reservation, locationAddress);

            context.getLogger().log("Reservation created successfully: " + reservation.getReservationId());

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(response))
                    .withHeaders(java.util.Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ));

        } catch (InvalidRequestException e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody(gson.toJson(java.util.Map.of("error", e.getMessage())));

        } catch (ReservationConflictException e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(409)
                    .withBody(gson.toJson(java.util.Map.of("error", e.getMessage())));

        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(gson.toJson(java.util.Map.of("error", "Internal server error")));
        }
    }


    private ReservationRequestDto parseReservationRequest(String requestBody) {
        if (StringUtils.isBlank(requestBody)) {
            throw new InvalidRequestException("Request body is required");
        }

        try {
            return gson.fromJson(requestBody, ReservationRequestDto.class);
        } catch (Exception e) {
            throw new InvalidRequestException("Invalid JSON format in request body");
        }
    }

    /**
     * Validates the reservation request data.
     */
    private void validateReservationRequest(ReservationRequestDto request) {
        if (request == null) {
            throw new InvalidRequestException("Reservation request is required");
        }

        if (StringUtils.isBlank(request.getLocationId())) {
            throw new InvalidRequestException("Location ID is required");
        }

        if (StringUtils.isBlank(request.getTableNumber())) {
            throw new InvalidRequestException("Table number is required");
        }

        if (request.getGuestsNumber() == null || request.getGuestsNumber() <= 0) {
            throw new InvalidRequestException("Number of guests must be greater than 0");
        }

        if (StringUtils.isBlank(request.getDate())) {
            throw new InvalidRequestException("Date is required");
        }

        if (StringUtils.isBlank(request.getTimeFrom())) {
            throw new InvalidRequestException("Start time is required");
        }

        if (StringUtils.isBlank(request.getTimeTo())) {
            throw new InvalidRequestException("End time is required");
        }

        // Validate date format
        try {
            LocalDate reservationDate = LocalDate.parse(request.getDate(), DATE_FORMATTER);
            if (reservationDate.isBefore(LocalDate.now())) {
                throw new InvalidRequestException("Reservation date cannot be in the past");
            }
        } catch (DateTimeParseException e) {
            throw new InvalidRequestException("Invalid date format. Use yyyy-MM-dd");
        }

        // Validate time formats
        try {
            LocalTime timeFrom = LocalTime.parse(request.getTimeFrom(), TIME_FORMATTER);
            LocalTime timeTo = LocalTime.parse(request.getTimeTo(), TIME_FORMATTER);

            if (!timeTo.isAfter(timeFrom)) {
                throw new InvalidRequestException("End time must be after start time");
            }
        } catch (DateTimeParseException e) {
            throw new InvalidRequestException("Invalid time format. Use HH:mm");
        }
    }

    private Reservation buildReservation(ReservationRequestDto request) {
        return Reservation.builder()
                .reservationId(UUID.randomUUID().toString())
                .locationId(request.getLocationId())
                .tableNumber(request.getTableNumber())
                .date(request.getDate())
                .time(request.getTimeFrom()) // Store start time
                .guests(request.getGuestsNumber())
                .status(CONFIRMED)
                .build();
    }

    private ReservationResponseDto buildReservationResponse(Reservation reservation, String locationAddress) {
        String timeSlot = String.format("%s-%s",
                reservation.getTime(),
                LocalTime.parse(reservation.getTime(), TIME_FORMATTER).plusMinutes(90).format(TIME_FORMATTER)
        );

        return new ReservationResponseDto(
                reservation.getReservationId(),
                reservation.getStatus(),
                locationAddress,
                reservation.getDate(),
                timeSlot,
                null,//TODO: Add assigned waiter ID if available
                reservation.getGuests().toString()
        );
    }
}