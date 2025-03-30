export interface User {
    id: number;
    name: string;
    avatar: string;
    phone: string;
}

export const mockMyself: User = {
    id: 1,
    name: '张三',
    avatar: '../../assets/profile/default-avatar.png',
    phone: '12345678901'
};
