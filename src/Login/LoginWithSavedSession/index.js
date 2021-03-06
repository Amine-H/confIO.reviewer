import React, {Component} from 'react';
import {
    AsyncStorage,
} from 'react-native';
import template from './loginWithSavedSession.template';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {actionCreators as eventDetailsDialog} from 'app/EventDetailsDialog';
import nativeStorage from "app/App/Services/nativeStorage"
import { fetchTalks } from 'app/App/Services/EventService';
import { creators as navActionCreators } from 'app/Navigator/navigator.actions';
import {Observable} from "rxjs"


export const actions = {
    FETCH_ALL_EVENTS: 'FETCH_ALL_EVENTS',
    SELECT_EVENT: 'SELECT_EVENT',
    SHOW_EVENT_DETAILS: 'SHOW_EVENT_DETAILS',
    HIDE_EVENT_DETAILS: 'HIDE_EVENT_DETAILS',
    DELETE_EVENT: 'DELETE_EVENT',
};

const actionCreators = {
    fetchEvents,
    selectEvent,
    showEventDetails,
    hideEventDetails,
    deleteEvent,
    GOTOHome,
};

function GOTOHome(event) {
    return navActionCreators.navigateToHome(
      fetchTalks(event)
    )
}

function readEventsFromStorage() {
    return nativeStorage.get('events').switchMap((events) => {
        return Observable.forkJoin(events.map(
            readEventDetails
        ))
    });
    // return events = AsyncStorage.getItem('events')
    // .then((events) => events? JSON.parse(events) : [])
    // .then((events) => {
    //     return Promise.all(
    //         events.map(
    //             readEventDetails
    //         )
    //     )
    // });

    function readEventDetails(eventCode) {
        return nativeStorage.get(`event-${eventCode}`).switchMap((event) => {
            return Observable.of(event || {})
        })
    }
}

function deleteEventFromStorage(eventToDelete) {
    return readEventsFromStorage()
        .switchMap((events) => {
            const updatedEventsList = events.filter(
                (event) => event.code != eventToDelete.code
            )
            const updatedEventsCodeList = updatedEventsList.map(
                (event) => event.code
            )
            return Observable.forkJoin([,
                nativeStorage.remove(`event-${eventToDelete.code}`),
                nativeStorage.save('events', updatedEventsCodeList)
            ])
                .switchMap(() => Observable.of(updatedEventsList));
        });
}


function fetchEvents() {
    const events = readEventsFromStorage().toPromise();
    return {
        type: actions.FETCH_ALL_EVENTS,
        payload: events,
    }
}

function selectEvent(e) {

    return {
        type: actions.SELECT_EVENT,
        payload: fetchTalks(e),
    }
}

function deleteEvent(e) {
    const updatedEvents = deleteEventFromStorage(e).toPromise();
    return {
        type: actions.DELETE_EVENT,
        payload: updatedEvents,
    }
}

function showEventDetails(e) {
    return {
        type: actions.SHOW_EVENT_DETAILS,
        payload: e,
    }
}

function hideEventDetails(e) {
    return {
        type: actions.HIDE_EVENT_DETAILS,
    }
}

function mapStateToProps(state) {
    return state.loginWithSavedSession;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(template);
