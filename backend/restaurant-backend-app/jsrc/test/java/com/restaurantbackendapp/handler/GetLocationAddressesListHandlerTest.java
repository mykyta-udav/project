package com.restaurantbackendapp.handler;

import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.restaurantbackendapp.handler.impl.GetLocationAddressesListHandler;
import com.restaurantbackendapp.model.Location;
import com.restaurantbackendapp.repository.LocationRepository;
import com.restaurantbackendapp.repository.impl.LocationRepositoryImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetLocationAddressesListHandlerTest {
    private LocationRepository repository;
    private Gson gson;
    private Context context;
    private LambdaLogger logger;
    private GetLocationAddressesListHandler handler;
    private APIGatewayProxyRequestEvent requestEvent;

    @BeforeEach
    void setUp() {
        repository = mock(LocationRepositoryImpl.class);
        gson = new Gson();
        context = mock(Context.class);
        logger = mock(LambdaLogger.class);
        handler = new GetLocationAddressesListHandler(repository, gson);
        requestEvent = new APIGatewayProxyRequestEvent();

    }

    @Test
    void testHandle_Success() {
        Map<String, AttributeValue> item1 = new HashMap<>();
        item1.put("locationId", new AttributeValue().withS("1"));
        item1.put("locationAddress", new AttributeValue().withS("123 Main St"));

        Map<String, AttributeValue> item2 = new HashMap<>();
        item2.put("locationId", new AttributeValue().withS("2"));
        item2.put("locationAddress", new AttributeValue().withS("456 Oak Ave"));

        List<Map<String, AttributeValue>> items = new ArrayList<>();
        items.add(item1);
        items.add(item2);

        ScanResult scanResult = new ScanResult().withItems(items);
        when(repository.findAllLocationAddresses()).thenReturn(scanResult);

        APIGatewayProxyResponseEvent response = handler.handle(requestEvent, context);

        assertEquals(200, response.getStatusCode());
        List<Location> locations = gson.fromJson(response.getBody(), new TypeToken<List<Location>>(){}.getType());
        assertEquals(2, locations.size());

        Location firstLocation = locations.get(0);
        assertEquals("1", firstLocation.locationId());
        assertEquals("123 Main St", firstLocation.address());

        Location secondLocation = locations.get(1);
        assertEquals("2", secondLocation.locationId());
        assertEquals("456 Oak Ave", secondLocation.address());

        verify(repository, times(1)).findAllLocationAddresses();
    }

    @Test
    void testHandle_EmptyList() {
        ScanResult scanResult = new ScanResult().withItems(new ArrayList<>());
        when(repository.findAllLocationAddresses()).thenReturn(scanResult);

        APIGatewayProxyResponseEvent response = handler.handle(requestEvent, context);

        assertEquals(200, response.getStatusCode());
        List<Location> locations = gson.fromJson(response.getBody(), new TypeToken<List<Location>>(){}.getType());
        assertEquals(0, locations.size());

        verify(repository, times(1)).findAllLocationAddresses();
    }

    @Test
    void testHandle_RepositoryException() {
        String errorMessage = "Failed to scan DynamoDB table";
        when(repository.findAllLocationAddresses()).thenThrow(new RuntimeException(errorMessage));
        when(context.getLogger()).thenReturn(logger);

        APIGatewayProxyResponseEvent response = handler.handle(requestEvent, context);

        assertEquals(500, response.getStatusCode());
        assertEquals(errorMessage, response.getBody());

        verify(repository, times(1)).findAllLocationAddresses();
        verify(logger, times(1)).log("Error: " + errorMessage);
    }

}