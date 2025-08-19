import { atom } from "recoil";
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist({
  key: 'retreatmore', 
  storage: sessionStorage,
});

export const recoilLoginState = atom({
  key: "loginState",
  default: false,
  effects_UNSTABLE: [persistAtom]
});

export const recoilUserData = atom({
  key: "userData",
  default: {
    userId: '',
    userName : ''
  },
  effects_UNSTABLE: [persistAtom]
});


