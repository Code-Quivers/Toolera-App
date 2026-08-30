import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";
import { useCustomerStore } from "@/store/useCustomerStore";

export interface CustomerAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  district: string;
  postalCode?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  joinedDate: string;
  shippingAddress?: CustomerAddress;
  billingAddress?: CustomerAddress;
}

export interface CustomerOrderHistory {
  id: string;
  date: string;
  createdAt?: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMethod: string;
  courierTracking?: string;
  items: Array<{
    title: string;
    variantName?: string;
    sku?: string;
    qty: number;
    price: number;
    image?: string;
  }>;
}

export interface RegisteredCustomer extends CustomerUser {
  password?: string;
  orders: CustomerOrderHistory[];
}

interface AuthResponse {
  success: boolean;
  message: string;
}

interface CustomerAuthState {
  customer: CustomerUser | null;
  isLoggedIn: boolean;
  orders: CustomerOrderHistory[];
  registeredUsers: RegisteredCustomer[];
  isAuthModalOpen: boolean;
  authModalView: "LOGIN" | "REGISTER";
  
  // Actions
  login: (identifier: string, pass: string) => AuthResponse;
  register: (
    name: string,
    email: string,
    phone: string,
    pass: string,
    address?: string,
    city?: string,
    district?: string
  ) => AuthResponse;
  logout: () => void;
  updateProfile: (updated: Partial<CustomerUser>) => void;
  updateShippingAddress: (addr: CustomerAddress) => void;
  updateBillingAddress: (addr: CustomerAddress) => void;
  addCustomerOrder: (order: CustomerOrderHistory) => void;
  openAuthModal: (view?: "LOGIN" | "REGISTER") => void;
  closeAuthModal: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      isLoggedIn: false,
      orders: [],
      registeredUsers: [],
      isAuthModalOpen: false,
      authModalView: "LOGIN",

      login: (identifier, pass) => {
        const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, "");
        const cleanPass = pass.trim();

        if (!cleanId) {
          return { success: false, message: "Please enter your mobile phone or email." };
        }

        const users = get().registeredUsers || [];
        const found = users.find((u) => {
          const userPhone = (u.phone || "").replace(/[^0-9]/g, "");
          const searchPhone = cleanId.replace(/[^0-9]/g, "");
          const matchPhone = searchPhone.length >= 7 && userPhone.includes(searchPhone);
          const matchEmail = (u.email || "").toLowerCase().trim() === cleanId;
          return matchPhone || matchEmail;
        });

        if (!found) {
          return {
            success: false,
            message: "No account found with this phone or email. Please create an account.",
          };
        }

        // Validate password if user set one
        if (found.password && cleanPass && found.password !== cleanPass) {
          return {
            success: false,
            message: "Incorrect password. Please verify and try again.",
          };
        }

        const userOrders = found.orders || [];

        set({
          customer: {
            id: found.id,
            name: found.name,
            email: found.email,
            phone: found.phone,
            avatarUrl: found.avatarUrl,
            joinedDate: found.joinedDate,
            shippingAddress: found.shippingAddress,
            billingAddress: found.billingAddress,
          },
          isLoggedIn: true,
          orders: userOrders,
          isAuthModalOpen: false,
        });

        return {
          success: true,
          message: `Welcome back, ${found.name}!`,
        };
      },

      register: (name, email, phone, pass, address = "", city = "Dhaka", district = "Dhaka") => {
        const cleanName = name.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim();
        const cleanPass = pass.trim();

        if (!cleanName || !cleanPhone) {
          return { success: false, message: "Name and Phone Number are required." };
        }

        const users = get().registeredUsers || [];
        
        // Check if phone or email already registered
        const existing = users.find((u) => {
          const uPhone = (u.phone || "").replace(/[^0-9]/g, "");
          const newPhone = cleanPhone.replace(/[^0-9]/g, "");
          const phoneExists = newPhone.length >= 7 && uPhone.includes(newPhone);
          const emailExists = cleanEmail && (u.email || "").toLowerCase() === cleanEmail.toLowerCase();
          return phoneExists || emailExists;
        });

        if (existing) {
          return {
            success: false,
            message: "An account with this phone number or email already exists. Please sign in.",
          };
        }

        const newId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
        const joinedDate = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const newShippingAddress: CustomerAddress | undefined = address.trim()
          ? {
              fullName: cleanName,
              phone: cleanPhone,
              streetAddress: address.trim(),
              city: city.trim() || "Dhaka",
              district: district.trim() || "Dhaka",
            }
          : undefined;

        const newCustomer: RegisteredCustomer = {
          id: newId,
          name: cleanName,
          email: cleanEmail || `${cleanPhone.replace(/[^0-9]/g, "")}@customer.raifasmart.com`,
          phone: cleanPhone,
          password: cleanPass || undefined,
          joinedDate,
          shippingAddress: newShippingAddress,
          billingAddress: newShippingAddress,
          orders: [], // 100% clean, no dummy orders for newly registered customers
        };

        const updatedUsers = [newCustomer, ...users];

        // Also push customer to admin customer store for dashboard sync
        try {
          useCustomerStore.getState().addCustomer({
            id: newId,
            name: cleanName,
            phone: cleanPhone,
            email: cleanEmail || "N/A",
            location: district || city || "Dhaka",
            address: address.trim() || `${city}, ${district}`,
            ordersCount: 0,
            totalSpent: 0,
            status: "ACTIVE",
            joinedDate: new Date().toISOString().split("T")[0],
            notes: "Registered via storefront account creation",
          });
        } catch (err) {
          console.warn("Failed to sync customer with admin store:", err);
        }

        set({
          registeredUsers: updatedUsers,
          customer: {
            id: newCustomer.id,
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            avatarUrl: newCustomer.avatarUrl,
            joinedDate: newCustomer.joinedDate,
            shippingAddress: newCustomer.shippingAddress,
            billingAddress: newCustomer.billingAddress,
          },
          isLoggedIn: true,
          orders: [], // clean empty orders
          isAuthModalOpen: false,
        });

        return {
          success: true,
          message: "Account created successfully! Welcome to Raifa's Mart.",
        };
      },

      logout: () => {
        set({
          customer: null,
          isLoggedIn: false,
          orders: [],
        });
      },

      updateProfile: (updated) => {
        const curr = get().customer;
        if (!curr) return;

        const updatedCustomer = { ...curr, ...updated };
        const users = get().registeredUsers.map((u) =>
          u.id === curr.id ? { ...u, ...updated } : u
        );

        set({
          customer: updatedCustomer,
          registeredUsers: users,
        });
      },

      updateShippingAddress: (addr) => {
        const curr = get().customer;
        if (!curr) return;

        const updatedCustomer = { ...curr, shippingAddress: addr };
        const users = get().registeredUsers.map((u) =>
          u.id === curr.id ? { ...u, shippingAddress: addr } : u
        );

        set({
          customer: updatedCustomer,
          registeredUsers: users,
        });
      },

      updateBillingAddress: (addr) => {
        const curr = get().customer;
        if (!curr) return;

        const updatedCustomer = { ...curr, billingAddress: addr };
        const users = get().registeredUsers.map((u) =>
          u.id === curr.id ? { ...u, billingAddress: addr } : u
        );

        set({
          customer: updatedCustomer,
          registeredUsers: users,
        });
      },

      addCustomerOrder: (order) => {
        const curr = get().customer;
        if (!curr) return;

        const orderWithTimestamp = {
          ...order,
          createdAt: order.createdAt || new Date().toISOString(),
        };

        const newOrders = [
          orderWithTimestamp,
          ...get().orders.filter((o) => o.id !== order.id),
        ];
        const users = get().registeredUsers.map((u) =>
          u.id === curr.id
            ? {
                ...u,
                orders: [
                  orderWithTimestamp,
                  ...(u.orders || []).filter((o) => o.id !== order.id),
                ],
              }
            : u
        );

        set({
          orders: newOrders,
          registeredUsers: users,
        });
      },

      openAuthModal: (view = "LOGIN") => {
        set({ isAuthModalOpen: true, authModalView: view });
      },

      closeAuthModal: () => {
        set({ isAuthModalOpen: false });
      },
    }),
    {
      name: "raifas_customer_auth_database_v3",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
