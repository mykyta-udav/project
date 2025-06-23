package com.restaurantbackendapp.handler.impl;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.restaurantbackendapp.dto.FeedbackPaginationQueryParams;
import com.restaurantbackendapp.dto.PageFeedbackResponse;
import com.restaurantbackendapp.handler.EndpointHandler;
import com.restaurantbackendapp.repository.FeedbackRepository;
import org.apache.commons.lang3.StringUtils;

import javax.inject.Inject;
import java.util.Arrays;
import java.util.Map;

public class GetRestaurantFeedbacksHandler implements EndpointHandler {
    public static final String ERROR = "Error";
    public static final String MESSAGE = "message";
    public static final String INTERNAL_SERVER_ERROR = "Internal Server Error";
    public static final String ID = "id";
    public static final String SORT = "sort";
    public static final String TYPE = "type";
    public static final String PAGE = "page";
    public static final String SIZE = "size";
    public static final String DATE = "date";
    public static final String ASC = "asc";
    private final FeedbackRepository repository;
    private final Gson gson;

    @Inject
    public GetRestaurantFeedbacksHandler(FeedbackRepository repository, Gson gson) {
        this.repository = repository;
        this.gson = gson;
    }

    @Override
    public APIGatewayProxyResponseEvent handle(APIGatewayProxyRequestEvent requestEvent, Context context) {
        try {
            FeedbackPaginationQueryParams queryParams = extractQueryParams(requestEvent);
            context.getLogger().log(gson.toJson(queryParams));

            PageFeedbackResponse pageFeedbackResponse = repository.getFeedbacks(
                    requestEvent.getPathParameters().get(ID),
                    queryParams.type().toUpperCase(),
                    queryParams.page(),
                    queryParams.size(),
                    queryParams.sortProperty(),
                    queryParams.sortDirection()
            );

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(gson.toJson(pageFeedbackResponse));
        } catch (Exception e) {
            context.getLogger().log(ERROR + e.getMessage());
            context.getLogger().log(ERROR + Arrays.toString(e.getStackTrace()));
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(gson.toJson(Map.of(
                            ERROR, INTERNAL_SERVER_ERROR,
                            MESSAGE, e.getMessage()
                    )));
        }
    }

    private FeedbackPaginationQueryParams extractQueryParams(APIGatewayProxyRequestEvent requestEvent) {
        Map<String, String> queryParameters = requestEvent.getQueryStringParameters();
        String sort = queryParameters.get(SORT);
        return new FeedbackPaginationQueryParams(
                queryParameters.get(TYPE),
                Integer.parseInt(queryParameters.get(PAGE)),
                Integer.parseInt(queryParameters.get(SIZE)),
                parseSortProperty(sort),
                parseSortDirection(sort)
        );
    }

    private static String parseSortProperty(String sort) {
        if (StringUtils.isBlank(sort) || !sort.contains(",")) {
            return DATE;
        }
        return sort.split(",")[0];
    }

    private static String parseSortDirection(String sort) {
        if (sort == null || !sort.contains(",") || sort.endsWith(",")) {
            return ASC;
        }
        return sort.split(",")[1];
    }
}
