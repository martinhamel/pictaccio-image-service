export interface ClientConfigInterface {
    app: {
        locale: string,
        password?: {
            policy: {
                symbols: number,
                lowercase: number,
                uppercase: number,
                numbers: number,
                minLength: number,
                maxLength: number
            }
        }
    }
}
