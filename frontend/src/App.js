import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Grid
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/images')
      .then(response => response.json())
      .then(data => {
        setImages(data);
        setLoading(false);
        console.log("data:", data);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
        setLoading(false);
      });
  }, []);

  const formatDate = (value) => {
    if (!value || typeof value !== 'number') return 'Invalid date';
    const date = new Date(value);
    return date.toLocaleString();
  };

  const calculateLatency = (sendAt, receiveAt) => {
    if (typeof sendAt !== 'number' || typeof receiveAt !== 'number') return 'N/A';
    return receiveAt - sendAt;
  };

  const calculateInterval = (currentCreatedAt, previousCreatedAt) => {
    if (typeof currentCreatedAt !== 'number' || typeof previousCreatedAt !== 'number') return 0;
    return currentCreatedAt - previousCreatedAt;
  };

  const latencyData = images.map(image => calculateLatency(image.sendAt, image.receiveAt));

  const intervalData = images.map((image, index) => {
    if (index === 0) return 0;
    return calculateInterval(image.createdAt, images[index-1].createdAt);
  });

  const chartData = {
    labels: images.map((image, index) => `Image ${image.id}`),
    datasets: [
      {
        label: 'Latency (ms)',
        data: latencyData,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  const intervalChartData = {
    labels: images.map((image, index) => `Image ${image.id}`),
    datasets: [
      {
        label: 'Interval Time (ms)',
        data: intervalData,
        fill: false,
        borderColor: 'rgba(153,102,255,1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" style={{ padding: '2rem 0' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        IoT Image Dashboard
      </Typography>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* Charts Section */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ marginBottom: '2rem', width: '100%' }}>
                <Line
                  data={chartData}
                  options={{ responsive: true, plugins: { title: { display: true, text: 'Latency Over Time' } } }}
                  style={{ height: '400px', width: '100%' }}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ marginBottom: '2rem', width: '100%' }}>
                <Line
                  data={intervalChartData}
                  options={{ responsive: true, plugins: { title: { display: true, text: 'Interval Time Between Images' } } }}
                  style={{ height: '400px', width: '100%' }}
                />
              </div>
            </Grid>
          </Grid>

          {/* Image Data Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Send At</strong></TableCell>
                  <TableCell><strong>Receive At</strong></TableCell>
                  <TableCell><strong>Latency</strong></TableCell>
                  <TableCell><strong>Image</strong></TableCell>
                  <TableCell><strong>Created At</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {images.map((image, i) => (
                  <TableRow key={i}>
                    <TableCell>{image.id}</TableCell>
                    <TableCell>{formatDate(image.sendAt)}</TableCell>
                    <TableCell>{formatDate(image.receiveAt)}</TableCell>
                    <TableCell>{calculateLatency(image.sendAt, image.receiveAt)} ms</TableCell>
                    <TableCell>
                      <Link href={image.url} target="_blank" rel="noopener">
                        Lihat Gambar
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(image.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}

export default App;
