package com.restaurantbackendapp.repository.impl;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.datamodeling.QueryResultPage;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.amazonaws.services.dynamodbv2.model.Select;
import com.restaurantbackendapp.dto.PageFeedbackResponse;
import com.restaurantbackendapp.dto.PageableObject;
import com.restaurantbackendapp.dto.SortObject;
import com.restaurantbackendapp.model.Feedback;
import com.restaurantbackendapp.repository.FeedbackRepository;
import javax.inject.Named;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class FeedbackRepositoryImpl implements FeedbackRepository {
    private final Map<Integer, Map<String, AttributeValue>> paginationKeys = new ConcurrentHashMap<>();
    public static final String DB_CLIENT = "dynamoDbClient";
    private static final String FEEDBACK_TABLE = "FEEDBACK_TABLE";
    private final AmazonDynamoDB dynamoDbClient;
    private final DynamoDBMapper dynamoDBMapper;

    public FeedbackRepositoryImpl(
            @Named(DB_CLIENT) AmazonDynamoDB dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.dynamoDBMapper = new DynamoDBMapper(
                dynamoDbClient,
                DynamoDBMapperConfig.builder()
                        .withTableNameOverride(DynamoDBMapperConfig.TableNameOverride.withTableNameReplacement(
                                System.getenv(FEEDBACK_TABLE)))
                        .withConsistentReads(DynamoDBMapperConfig.ConsistentReads.EVENTUAL)
                        .build());
    }

    @Override
    public PageFeedbackResponse getFeedbacks(String locationId, String type, int page, int size, String sortProperty, String sortDirection) {
        Map<String, AttributeValue> expressionAttributeValues = Map.of(
                ":locationId", new AttributeValue().withS(locationId),
                ":type", new AttributeValue().withS(type)
        );

        Integer totalNumber = getTotalNumber(expressionAttributeValues);

        DynamoDBQueryExpression<Feedback> queryExpression = new DynamoDBQueryExpression<Feedback>()
                .withIndexName("FeedbacksByTypeIndex")
                .withKeyConditionExpression("locationId = :locationId AND #type = :type")
                .withExpressionAttributeNames(Map.of("#type", "type"))
                .withExpressionAttributeValues(expressionAttributeValues)
                .withConsistentRead(false)
                .withLimit(size)
                .withExclusiveStartKey(getExclusiveStartKey(page));

        QueryResultPage<Feedback> queryResultPage = dynamoDBMapper.queryPage(Feedback.class, queryExpression);
        List<Feedback> feedbacks = sortFeedbacks(queryResultPage.getResults(), sortProperty, sortDirection);

        saveLastEvaluatedKey(page + 1, queryResultPage.getLastEvaluatedKey());

        return buildPageFeedbackResponse(
                totalNumber,
                feedbacks,
                queryResultPage.getLastEvaluatedKey(),
                page,
                size,
                sortProperty,
                sortDirection
        );
    }

    private Integer getTotalNumber(Map<String, AttributeValue> expressionAttributeValues) {
        QueryRequest queryRequest = new QueryRequest()
                .withTableName(System.getenv(FEEDBACK_TABLE))
                .withIndexName("FeedbacksByTypeIndex")
                .withKeyConditionExpression("locationId = :locationId AND #type = :type")
                .withExpressionAttributeNames(Map.of("#type", "type"))
                .withExpressionAttributeValues(expressionAttributeValues)
                .withConsistentRead(false)
                .withSelect(Select.COUNT);

        QueryResult queryResult = dynamoDbClient.query(queryRequest);
        return queryResult.getCount();
    }

    private List<Feedback> sortFeedbacks( List<Feedback> feedbacks, String sortProperty, String sortDirection) {
        Comparator<Feedback> comparator = switch (sortProperty) {
            case "rate" -> Comparator.comparing(Feedback::getRate);
            case "date" -> Comparator.comparing(Feedback::getDate);
            default -> throw new IllegalArgumentException("Unsupported sort property: " + sortProperty);
        };

        if ("desc".equalsIgnoreCase(sortDirection)) {
            comparator = comparator.reversed();
        }

        feedbacks.sort(comparator);

        return feedbacks;
    }

    private PageFeedbackResponse buildPageFeedbackResponse(Integer totalElements,
                                                           List<Feedback> feedbacks,
                                                           Map<String, AttributeValue> lastEvaluatedKey,
                                                           Integer page,
                                                           Integer size,
                                                           String sortProperty,
                                                           String sortDirection) {
        int numberOfElements = feedbacks.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        SortObject sortObject = new SortObject(
                sortDirection,
                "default",
                "asc".equalsIgnoreCase(sortDirection),
                sortProperty,
                true
        );

        PageableObject pageableObject = new PageableObject(
                page * size,
                List.of(sortObject),
                true,
                size,
                page,
                false
        );

        boolean isLastPage = (lastEvaluatedKey == null);

        return new PageFeedbackResponse(
                totalPages,
                totalElements,
                size,
                feedbacks,
                page,
                List.of(sortObject),
                page == 0,             // Is this the first page?
                isLastPage,
                numberOfElements,
                pageableObject,
                feedbacks.isEmpty()
        );
    }

    private void saveLastEvaluatedKey(int page, Map<String, AttributeValue> lastEvaluatedKey) {
        if (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty()) {
            paginationKeys.put(page, lastEvaluatedKey);
        }
    }

    // Retrieve the ExclusiveStartKey for a page
    private Map<String, AttributeValue> getExclusiveStartKey(int page) {
        return paginationKeys.getOrDefault(page, null); // Return null if no key exists
    }
}
