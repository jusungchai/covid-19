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

  const [data, setData] = useState(null);

  useEffect(() => {
    const today = getDate();
    axios.get(`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${today}.csv`)
      .then(res => {
        const parsedData = Papa.parse(res.data).data;
        parsedData.shift()
        const countries = {};
        parsedData.forEach(elm => {
          if (countries[elm[1]]) {
            countries[elm[1]].confirmed += parseInt(elm[3]);
            countries[elm[1]].deaths += parseInt(elm[4]);
            countries[elm[1]].recovered += parseInt(elm[5]);
          } else {
            countries[elm[1]] = {
              confirmed: parseInt(elm[3]),
              deaths: parseInt(elm[4]),
              recovered: parseInt(elm[5])
            };
          }
        })
        setData(countries);
      })
      .catch(err => {
        alert(err)
      })
  }, []);

  const getDate = () => {
    let today = new Date();
    today.setDate(today.getDate() - 1);
    let dd = today.getDate();

    let mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    if (dd < 10) {
      dd = `0${dd}`;
    }

    if (mm < 10) {
      mm = `0${mm}`;
    }
    today = mm + '-' + dd + '-' + yyyy;
    return today;
  }

  const createColumn = () => {
    const columns = [
      { title: 'Country', field: 'country' },
      { title: 'Confirmed', field: 'confirmed' },
      { title: 'Deaths', field: 'deaths' },
      { title: 'Recovered', field: 'recovered' }
    ]
    return columns;
  }

  const createData = () => {
    const dataArray = [];
    if (data) {
      for (const [country, value] of Object.entries(data)) {
        const object = { country, confirmed: value.confirmed, deaths: value.deaths, recovered: value.recovered };
        dataArray.push(object);
      }
    }
    dataArray.sort((a, b) => b.confirmed - a.confirmed)
    return dataArray;
  }

  const buildTable = () => {
    if (data) {
      return (
        <MaterialTable
          icons={tableIcons}
          title={`COVID-19 Global Stats Summary Ending ${getDate()}`}
          options={{ sorting: false, draggable: false }}
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
      <h6>Copyright - Jusung Chai</h6>
    </React.Fragment>
  );
}

export default App;
