import React, { forwardRef, useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import Papa from 'papaparse';
import MaterialTable from 'material-table'
import { Clear, FirstPage, LastPage, ChevronRight, ChevronLeft, Search } from "@material-ui/icons"

function App() {

  const tableIcons = {
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />)
  };

  const [data, setData] = useState({
    confirmed: null,
    deaths: null,
    latestDate: null,
    prevDate: null,
    data: null
  })

  useEffect(() => {
    const confirmed = axios.get(`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv`);
    const deaths = axios.get(`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv`);
    Promise.all([
      Promise.resolve(confirmed),
      Promise.resolve(deaths)
    ]).then(all => {
      const confirmedParsed = Papa.parse(all[0].data).data;
      const deathsParsed = Papa.parse(all[1].data).data;
      setData({
        ...data,
        latestDate: confirmedParsed[0][confirmedParsed[0].length - 1],
        prevDate: confirmedParsed[0][confirmedParsed[0].length - 2],
        confirmed: confirmedParsed,
        deaths: deathsParsed
      })
    })
  }, [])

  useEffect(() => {
    if (data.confirmed && data.deaths && data.latestDate && data.prevDate) {
      data.confirmed.shift();
      data.deaths.shift();
      const countries = {};
      data.confirmed.forEach(elm => {
        if (countries[elm[1]]) {
          countries[elm[1]].confirmedLatest += parseInt(elm[elm.length - 1]);
          countries[elm[1]].confirmedPrev += parseInt(elm[elm.length - 2]);
        } else {
          countries[elm[1]] = {
            confirmedLatest: parseInt(elm[elm.length - 1]),
            confirmedPrev: parseInt(elm[elm.length - 2]),
            deathsLatest: 0,
            deathsPrev: 0
          }
        }
      })
      data.deaths.forEach(elm => {
        if (countries[elm[1]]) {
          countries[elm[1]].deathsLatest += parseInt(elm[elm.length - 1]);
          countries[elm[1]].deathsPrev += parseInt(elm[elm.length - 2]);
        } else {
          countries[elm[1]] = {
            confirmedLatest: 0,
            confirmedPrev: 0,
            deathsLatest: parseInt(elm[elm.length - 1]),
            deathsPrev: parseInt(elm[elm.length - 2])
          }
        }
      })
      setData({
        ...data,
        data: countries
      })
    }
  }, [data.confirmed && data.deaths && data.latestDate && data.prevDate])

  const createColumn = () => {
    const columns = [
      { title: 'Country', field: 'country' },
      { title: 'Confirmed', field: 'confirmedLatest' },
      { title: 'New Confirmed', field: 'newConfirmed' },
      { title: 'Deaths', field: 'deathsLatest' },
      { title: 'New Deaths', field: 'newDeaths' }
    ]
    return columns;
  }

  const createData = () => {
    const dataArray = [];
    if (data.data) {
      for (const [country, value] of Object.entries(data.data)) {
        const object = {
          country,
          confirmedLatest: value.confirmedLatest,
          newConfirmed: value.confirmedLatest - value.confirmedPrev,
          deathsLatest: value.deathsLatest,
          newDeaths: value.deathsLatest - value.deathsPrev
        }
        dataArray.push(object);
      }
    }
    dataArray.sort((a, b) => b.confirmedLatest - a.confirmedLatest)
    return dataArray;
  }
  
  const buildTable = () => {
    if (data) {
      return (
        <MaterialTable
          icons={tableIcons}
          title={`COVID-19 Global Stats Summary Ending ${data.latestDate}`}
          options={{ sorting: false, draggable: false, pageSize: 20, pageSizeOptions: [] }}
          columns={createColumn()}
          data={createData()}
        />
      );
    }
    return null;
  }

  return (
    <React.Fragment>
      {buildTable()}
      <h6 id='copyright'>Copyright - Jay Jusung Chai</h6>
    </React.Fragment>
  );
}

export default App;
