import mockData from '@/data/mockData.json';
import homeData from '@/data/homeData.json';
import restaurantsData from '@/data/restaurants.json';
import foodsData from '@/data/foods.json';
import groupOrdersData from '@/data/groupOrders.json';
import paymentData from '@/data/paymentData.json';
import orderTrackingData from '@/data/orders.json';
import profileData from '@/data/profileData.json';
import loyaltyData from '@/data/loyalty.json';
import notificationsData from '@/data/notifications.json';
import settingsData from '@/data/settings.json';
import searchData from '@/data/searchData.json';
import promotionsData from '@/data/promotionsData.json';
import { Product, Category, User, Order, ApiResponse } from '@/types';

export type HomeDataType = typeof homeData;
export type RestaurantDetailType = typeof restaurantsData[0];
export type FoodCategoryType = typeof foodsData.categories[0];
export type FoodItemType = typeof foodsData.foods[0];
export type GroupOrderType = typeof groupOrdersData.openGroups[0];
export type GroupMemberType = typeof groupOrdersData.openGroups[0]['members'][0];
export type GroupFoodType = typeof groupOrdersData.openGroups[0]['orderedFoods'][0];
export type PaymentDataType = typeof paymentData;
export type OrderTrackingType = typeof orderTrackingData;
export type ProfileDataType = typeof profileData;
export type LoyaltyDataType = typeof loyaltyData;
export type NotificationsDataType = typeof notificationsData;
export type SettingsDataType = typeof settingsData;
export type SearchDataType = typeof searchData;
export type PromotionsDataType = typeof promotionsData;

/**
 * Data Service abstraction for fetching static JSON datasets.
 * Scalable design allows seamlessly swapping local JSON data with real API endpoints in future.
 */
class DataService {
  private simulateDelay<T>(data: T, delayMs: number = 100): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data,
        });
      }, delayMs);
    });
  }

  // Home Screen JSON Data
  async getHomeData(): Promise<ApiResponse<HomeDataType>> {
    return this.simulateDelay(homeData);
  }

  // Promotions & Gamification JSON Data
  async getPromotionsData(): Promise<ApiResponse<PromotionsDataType>> {
    return this.simulateDelay(promotionsData);
  }

  // Search JSON Data
  async getSearchData(): Promise<ApiResponse<SearchDataType>> {
    return this.simulateDelay(searchData);
  }

  // Settings JSON Data
  async getSettingsData(): Promise<ApiResponse<SettingsDataType>> {
    return this.simulateDelay(settingsData);
  }

  // Notifications JSON Data
  async getNotificationsData(): Promise<ApiResponse<NotificationsDataType>> {
    return this.simulateDelay(notificationsData);
  }

  // Loyalty JSON Data
  async getLoyaltyData(): Promise<ApiResponse<LoyaltyDataType>> {
    return this.simulateDelay(loyaltyData);
  }

  // Profile JSON Data
  async getProfileData(): Promise<ApiResponse<ProfileDataType>> {
    return this.simulateDelay(profileData);
  }

  // Order Tracking Data
  async getOrderTracking(): Promise<ApiResponse<OrderTrackingType>> {
    return this.simulateDelay(orderTrackingData);
  }

  // Payment JSON Data
  async getPaymentData(): Promise<ApiResponse<PaymentDataType>> {
    return this.simulateDelay(paymentData);
  }

  // Cart Sync Simulation
  async syncCart(localCart: any[]): Promise<ApiResponse<{ serverCart: any[] }>> {
    const mockServerCart = [
      {
        product: {
          id: 'food_1',
          name: 'Pizza Margherita',
          description: 'Sauce tomate, mozzarella fraîche, basilic.',
          price: 59,
          unit: 'portion',
          categoryId: 'pizza',
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
          rating: 4.8,
          isAvailable: true,
        },
        quantity: 1,
      },
    ];
    return this.simulateDelay({ serverCart: mockServerCart }, 300);
  }

  // Server API simulation for optimistic add-to-cart confirmation
  async addItemToCartServer(product: any, quantity: number = 1): Promise<ApiResponse<{ success: boolean }>> {
    // If product ID contains 'fail' or 'unavailable', simulate server rejection for rollback testing
    if (product.id && (product.id.includes('fail') || product.id.includes('unavailable'))) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: false, data: { success: false }, message: 'Rupture de stock ou erreur serveur.' });
        }, 300);
      });
    }
    return this.simulateDelay({ success: true }, 300);
  }



  // Group Orders JSON Data
  async getGroupOrders(): Promise<ApiResponse<GroupOrderType[]>> {
    return this.simulateDelay(groupOrdersData.openGroups as GroupOrderType[]);
  }

  async getGroupOrderById(groupId: string): Promise<ApiResponse<GroupOrderType | null>> {
    const group = groupOrdersData.openGroups.find((g) => g.id === groupId) || groupOrdersData.openGroups[0];
    return this.simulateDelay(group || null);
  }

  // Restaurant Detail JSON Data
  async getRestaurantById(id: string): Promise<ApiResponse<RestaurantDetailType | null>> {
    const resto = restaurantsData.find((r) => r.id === id) || restaurantsData[0];
    return this.simulateDelay(resto || null);
  }

  // Foods Menu JSON Data
  async getFoodsByRestaurant(restaurantId: string): Promise<
    ApiResponse<{ categories: FoodCategoryType[]; foods: FoodItemType[] }>
  > {
    const foods = foodsData.foods.filter((f) => f.restaurantId === restaurantId || restaurantId === 'pizza-hut');
    return this.simulateDelay({
      categories: foodsData.categories as FoodCategoryType[],
      foods: foods as FoodItemType[],
    });
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.simulateDelay(mockData.categories as Category[]);
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category | null>> {
    const category = mockData.categories.find((c) => c.id === id) as Category | undefined;
    return this.simulateDelay(category || null);
  }

  // Products
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.simulateDelay(mockData.products as Product[]);
  }

  async getProductsByCategory(categoryId: string): Promise<ApiResponse<Product[]>> {
    const products = mockData.products.filter((p) => p.categoryId === categoryId) as Product[];
    return this.simulateDelay(products);
  }

  async getProductById(id: string): Promise<ApiResponse<Product | null>> {
    const product = mockData.products.find((p) => p.id === id) as Product | undefined;
    return this.simulateDelay(product || null);
  }

  // Orders
  async getOrdersByUserId(userId: string): Promise<ApiResponse<Order[]>> {
    const orders = mockData.orders.filter((o) => o.userId === userId) as Order[];
    return this.simulateDelay(orders);
  }

  // User Profile
  async getUserProfile(userId: string): Promise<ApiResponse<User | null>> {
    const user = mockData.users.find((u) => u.id === userId) as User | undefined;
    return this.simulateDelay(user || null);
  }
}

export const dataService = new DataService();
export default dataService;
