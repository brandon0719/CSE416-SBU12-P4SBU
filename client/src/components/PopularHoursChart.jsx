import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ApiService from '../services/ApiService';

const PopularHoursChart = ({lot, date}) => {
  const [data, setData] = useState(null);

  // useEffect(() => {
  //   console.log(lot)
  //   console.log("day:" + day)
  //   ApiService.getPopularHours(lot, day)
  //     .then(response => console.log(response))
  //     .then(response => setData(response));
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const day = date.getDay()
        const response = await ApiService.getPopularHours(lot, day);
        console.log(day)
        console.log("API Response:", response);
        setData(response);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, [lot, date]);

  if (!data) return <div>Loading...</div>;

  // Transform data for Recharts
  const chartData = data.map((count, hour) => {
    const hour12 = hour % 12 || 12; // Convert 0-23 to 1-12
    const ampm = hour < 12 ? 'AM' : 'PM';
    return {
      hour: `${hour12}${ampm}`, // Formats like "9:00 AM"
      count
    };
  });

  return (
    <div>
      <h2>{lot}:<br/>Popular Hours on {new Intl.DateTimeFormat("en-US", {weekday: "long"}).format(date)}</h2>
      

      <div style={{ width: 400, height: 200 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 40, left: -40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis tickFormatter={() => ''}/>
            <Tooltip />
            <Bar dataKey="count" fill="#007BFF"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PopularHoursChart;