export interface UserPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN'; // Adjust roles as per your app
}
