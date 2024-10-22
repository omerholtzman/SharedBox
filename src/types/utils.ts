export type UpdateOperations<T> = {
    $set?: Partial<T>;
    $push?: Partial<Record<keyof T, any>>;
    $pull?: Partial<Record<keyof T, any>>;
};