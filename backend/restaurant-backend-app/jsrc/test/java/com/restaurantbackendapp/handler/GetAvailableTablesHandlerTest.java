package com.restaurantbackendapp.handler;

import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.restaurantbackendapp.handler.impl.GetAvailableTablesHandler;
import com.restaurantbackendapp.model.Table;
import com.restaurantbackendapp.repository.ReservationRepository;
import com.restaurantbackendapp.repository.impl.ReservationRepositoryImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetAvailableTablesHandlerTest {
    private ReservationRepository repository;
    private Gson gson;
    private Context context;
    private LambdaLogger logger;
    private GetAvailableTablesHandler handler;
    private APIGatewayProxyRequestEvent requestEvent;

    @BeforeEach
    void setUp() {
        repository = mock(ReservationRepositoryImpl.class);
        gson = new Gson();
        context = mock(Context.class);
        logger = mock(LambdaLogger.class);
        handler = new GetAvailableTablesHandler(repository, gson);

        requestEvent = new APIGatewayProxyRequestEvent();
        Map<String, String> queryParams = new HashMap<>();
        queryParams.put("locationId", "1");
        queryParams.put("date", "2025-06-14");
        queryParams.put("time", "12:00");
        queryParams.put("guests", "2");

        requestEvent.setQueryStringParameters(queryParams);
    }

    @Test
    void testHandle_statusCode_200() {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("locationId", new AttributeValue().withS("1"));
        item.put("date", new AttributeValue().withS("2025-06-14"));
        item.put("tableNumber", new AttributeValue().withS("5"));
        item.put("time", new AttributeValue().withS("12:00"));
        item.put("guests", new AttributeValue().withN("2"));
        item.put("status", new AttributeValue().withS("AVAILABLE"));

        List<Map<String, AttributeValue>> items = new ArrayList<>();
        items.add(item);

        QueryResult queryResult = new QueryResult().withItems(items);
        when(repository.fetchAvailableTables(any(), any())).thenReturn(queryResult);
        when(repository.fetchLocationAddress(any(), any())).thenReturn("Test Address");

        APIGatewayProxyResponseEvent response = handler.handle(requestEvent, context);

        List<Table> tables = gson.fromJson(response.getBody(), new TypeToken<List<Table>>(){}.getType());
        assertEquals(200, response.getStatusCode());
        assertEquals(1, tables.size());
        Table table = tables.get(0);
        assertEquals("5", table.getTableNumber());
        assertEquals("Test Address", table.getLocationAddress());
        assertEquals(List.of("12:00-13:30"), table.getAvailableSlots());
    }

    @Test
    void testHandle_MissingLocationId() {
        Map<String, String> queryParams = new HashMap<>();
        requestEvent.setQueryStringParameters(queryParams);

        when(context.getLogger()).thenReturn(logger);

        APIGatewayProxyResponseEvent response = handler.handle(requestEvent, context);

        assertEquals(400, response.getStatusCode());
        assertEquals("Query parameters cannot be null or empty.", response.getBody());
    }

    @Test
    void testHandle_NullQueryParams() {
        requestEvent.setQueryStringParameters(null);

        when(context.getLogger()).thenReturn(logger);

        APIGatewayProxyResponseEvent response = handler.handle(requestEvent, context);

        assertEquals(400, response.getStatusCode());
        assertEquals("Query parameters cannot be null or empty.", response.getBody());
    }


}