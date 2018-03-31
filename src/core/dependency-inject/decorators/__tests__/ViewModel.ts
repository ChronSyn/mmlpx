/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2017-08-24
 */

import { test } from 'ava';
import Injector from '../../Injector';
import { modelTypeSymbol, viewModelSymbol } from '../../meta';
import ViewModel from '../ViewModel';

const viewModelName = 'kuitosViewModel';

@ViewModel(viewModelName)
class ViewModelClass {
}

test('ViewModel decorator should add modelTypeSymbol', t => {
	t.is((ViewModelClass as any)[modelTypeSymbol], viewModelSymbol);
});

test('named ViewModel will be stored in injector', t => {

	const injector = Injector.getDefaultInjector();
	const instance = injector.get<ViewModelClass>(ViewModelClass, {});
	const snapshot = injector.dump();
	t.is(snapshot[viewModelName], instance);
});
