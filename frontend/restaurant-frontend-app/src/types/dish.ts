export interface Dish {
  id?: string;
  name: string;
  price: string;
  weight: string;
  imageUrl: string;
  previewImageUrl?: string;
  state?: string;
}

export interface DetailedDish extends Dish {
  id: string;
  calories: string;
  carbohydrates: string;
  description: string;
  dishType: string;
  fats: string;
  proteins: string;
  vitamins: string;
}

export interface PopularDishesResponse {
  dishes: Dish[];
}

export interface MenuResponse {
  content: Dish[];
}

export type DishType = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT';
export type SortOption = 'price,asc' | 'price,desc' | 'popularity,asc' | 'popularity,desc'; 