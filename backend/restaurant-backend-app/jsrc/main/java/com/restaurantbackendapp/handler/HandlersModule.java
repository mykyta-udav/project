package com.restaurantbackendapp.handler;

import com.google.gson.Gson;
import com.restaurantbackendapp.handler.impl.GeneralHandler;
import com.restaurantbackendapp.handler.impl.GetAvailableTablesHandler;
import com.restaurantbackendapp.handler.impl.GetLocationAddressesListHandler;
import com.restaurantbackendapp.handler.impl.GetLocationSpecialityDishesHandler;
import com.restaurantbackendapp.handler.impl.GetMainPageLocationsHandler;
import com.restaurantbackendapp.handler.impl.GetPopularDishesHandler;
import com.restaurantbackendapp.handler.impl.GetRestaurantFeedbacksHandler;
import com.restaurantbackendapp.handler.impl.GetUserProfileHandler;
import com.restaurantbackendapp.handler.impl.NotFoundHandler;
import com.restaurantbackendapp.handler.impl.SignInHandler;
import com.restaurantbackendapp.handler.impl.SignUpHandler;
import com.restaurantbackendapp.repository.DishRepository;
import com.restaurantbackendapp.repository.FeedbackRepository;
import com.restaurantbackendapp.repository.LocationRepository;
import com.restaurantbackendapp.repository.ReservationRepository;
import dagger.Module;
import dagger.Provides;
import dagger.multibindings.IntoMap;
import dagger.multibindings.StringKey;
import javax.inject.Named;
import javax.inject.Singleton;
import java.util.Map;

@Module
public class HandlersModule {

    @Singleton
    @Provides
    @Named("general")
    public EndpointHandler provideGeneralHandler(
            @Named("notFound") EndpointHandler notFoundHandler,
            Map<String, EndpointHandler> handlerMap) {
        return new GeneralHandler(notFoundHandler, handlerMap);
    }

    @Singleton
    @Provides
    @Named("notFound")
    public EndpointHandler provideNotFoundHandler(Gson gson) {
        return new NotFoundHandler(gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("POST:/auth/sign-in")
    public EndpointHandler provideSignInHandler(SignInHandler handler) {
        return handler;
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("POST:/auth/sign-up")
    public EndpointHandler provideSignUpHandler(SignUpHandler handler) {
        return handler;
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/bookings/tables")
    public EndpointHandler provideGetTablesHandler(ReservationRepository repo, Gson gson,  LocationRepository locRepo) {
        return new GetAvailableTablesHandler(repo, gson, locRepo);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/locations/select-options")
    public EndpointHandler provideGetLocationAddressesListHandler(LocationRepository repo, Gson gson) {
        return new GetLocationAddressesListHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/locations")
    public EndpointHandler provideGetMainPageLocationsHandler(LocationRepository repo, Gson gson) {
        return new GetMainPageLocationsHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/dishes/popular")
    public EndpointHandler provideGetPopularDishesHandler(DishRepository repo, Gson gson) {
        return new GetPopularDishesHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/locations/{id}/speciality-dishes")
    public EndpointHandler provideGetLocationSpecialityDishesHandler(LocationRepository repo, Gson gson) {
        return new GetLocationSpecialityDishesHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/locations/{id}/feedbacks")
    public EndpointHandler provideGetRestaurantFeedbacksHandler(FeedbackRepository repo, Gson gson) {
        return new GetRestaurantFeedbacksHandler(repo, gson);
    }

    @Singleton
    @Provides
    @IntoMap
    @StringKey("GET:/users/profile")
    public EndpointHandler provideGetUserProfileHandler(GetUserProfileHandler handler){
        return handler;
    }
}
