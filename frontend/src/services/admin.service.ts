import { api } from './api';

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  customersCount: number;
  sellersCount: number;
}

export const adminService = {
  async getMetrics(): Promise<AdminMetrics> {
    const res = await api.get<{ data: AdminMetrics }>('/admin/metrics');
    return res.data.data;
  },

  async getUsers(): Promise<any[]> {
    const res = await api.get<{ data: any[] }>('/admin/users');
    return res.data.data;
  },

  async updateSellerStatus(userId: string, status: string): Promise<void> {
    await api.patch(`/admin/sellers/${userId}/status`, { status });
  },

  async createCategory(data: { name: string; slug?: string; parentId?: string; isActive?: boolean }): Promise<any> {
    const res = await api.post('/categories', data);
    return res.data.data;
  },

  async updateCategory(id: string, data: { name?: string; isActive?: boolean }): Promise<any> {
    const res = await api.put(`/categories/${id}`, data);
    return res.data.data;
  },
};
