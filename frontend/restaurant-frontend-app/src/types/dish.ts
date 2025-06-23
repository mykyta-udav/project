export interface Dish {
  name: string;
  price: string;
  weight: string;
  imageUrl: string;
}

export interface PopularDishesResponse {
  dishes: Dish[];
} 