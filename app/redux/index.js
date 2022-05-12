import { combineReducers } from 'redux';
import _ from 'lodash';

import { cmsCollection } from 'shoutem.cms';

import { mapReducers } from '@shoutem/redux-composers';
import { find, storage, collection } from '@shoutem/redux-io';

import { ext } from '../const';

const _15min = 15 * 60;

export function getProviderId(action) {
  return _.get(action, ['meta', 'params', 'query', 'filter[provider.id]']);
}

export function getSpecialtyId(action) {
  return _.get(action, ['meta', 'params', 'query', 'filter[specialty.id]']);
}

function createCollectionCreator(schema, settings, keyPrefix) {
  return (key) => collection(schema, `${keyPrefix}-${key}`, settings);
}

export function fetchAllSpecialties(queryParams = {}, tag = 'allSpecialties') {
  return find('motovate.auth.specialties', tag, {
    query: {
      'page[limit]': 20000,
      ...queryParams,
    } });
}

export function vananciesSpecialtyCollection(schema, keyPrefix) {
  return mapReducers(getSpecialtyId, createCollectionCreator(schema, { expirationTime: _15min }, keyPrefix));
}

export function vananciesProviderCollection(schema, keyPrefix) {
  return mapReducers(getProviderId, createCollectionCreator(schema, { expirationTime: _15min }, keyPrefix));
}

export default combineReducers({
  allProviders: storage(ext('providers')),
  providers: cmsCollection(ext('providers')),
  allVacancies: storage(ext('vacancies')),
  vacancies: collection(ext('vacancies')),
  filteredVacancies: vananciesProviderCollection(ext('vacancies'), 'provider'),
  specialtyVacancies: vananciesSpecialtyCollection(ext('vacancies'), 'specialty'),
});
