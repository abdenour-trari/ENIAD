export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'restaurant/[id]': { id: string };
  payment: undefined;
  tracking: { orderId?: string };
  notifications: undefined;
  settings: undefined;
  loyalty: undefined;
  'edit-profile': undefined;
  cart: undefined;
  'group-order': { groupId?: string };
  '(auth)/index': undefined;
  '(auth)/login': undefined;
  '(auth)/register': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
