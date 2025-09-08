import { PublicUser } from '@pictaccio/image-service/src/database/models/public_user';

export default (async function (): Promise<void> {
    let users;
    try {
        users = await PublicUser.find();
    } catch (e) {
        users = undefined;
    }
    console.log(users);
});
