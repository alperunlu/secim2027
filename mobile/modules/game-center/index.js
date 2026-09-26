import { requireOptionalNativeModule } from 'expo';

/* Yalnız iOS'ta derlenir. Android'de ve Expo Go'da null döner; çağıranlar
   bunu "Game Center yok" diye okuyup sessizce geçer. */
const GameCenter = requireOptionalNativeModule('GameCenter');

export default GameCenter;
