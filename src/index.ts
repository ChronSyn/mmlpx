/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2017-07-12
 */

import inject from './core/dependency-inject/decorators/inject';
import postConstruct from './core/dependency-inject/decorators/postConstruct';
import Store from './core/dependency-inject/decorators/Store';
import ViewModel from './core/dependency-inject/decorators/ViewModel';
import instantiate from './core/dependency-inject/instantiate';
import { IMmlpx, modelNameSymbol } from './core/dependency-inject/meta';

export { onSnapshot, applySnapshot, patchSnapshot, getSnapshot } from './api/snapshot';

export function getModelName<T>(model: IMmlpx<T>) {
	return model[modelNameSymbol];
}

export {
	inject,
	ViewModel,
	Store,
	postConstruct,
	instantiate,
};
