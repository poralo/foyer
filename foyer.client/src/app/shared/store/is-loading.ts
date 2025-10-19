import { signalStoreFeature, withState } from '@ngrx/signals';

export function withLoading() {
  return signalStoreFeature(withState({ isLoading: true }));
}
