export type Shareholder = {
id: string;
name: string;
phone?: string | null;
address?: string | null;
shareValue: string; // decimal serialized as string
createdAt: string;
updatedAt: string;
};