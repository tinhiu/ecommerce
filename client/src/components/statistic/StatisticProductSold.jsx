import { merge } from 'lodash';
import { Icon } from '@iconify/react';
import ReactApexChart from 'react-apexcharts';
import trendingUpFill from '@iconify/icons-eva/trending-up-fill';
import trendingDownFill from '@iconify/icons-eva/trending-down-fill';
// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Card, Typography, Stack } from '@material-ui/core';
// utils
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fNumber, fPercent } from '../../utils/formatNumber';
//
import BaseOptionChart from '../charts/BaseOptionChart';
import useLocales from '../../hooks/useLocales';
import { getAllProducts, getAllProductsStatic } from '../../redux/slices/productSlice';

// ----------------------------------------------------------------------

const IconWrapperStyle = styled('div')(({ theme }) => ({
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
  color: theme.palette.success.main,
  backgroundColor: alpha(theme.palette.success.main, 0.16)
}));

// ----------------------------------------------------------------------

const CHART_DATA = [{ data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14] }];

export default function StatisticProductSold() {
  const { t } = useLocales();
  const dispatch = useDispatch();
  const { totalSold } = useSelector((state) => state.product.dashboard);
  const [percent, setPercent] = useState(53);
  useEffect(() => {
    dispatch(getAllProductsStatic());
  }, [dispatch]);
  const chartOptions = merge(BaseOptionChart(), {
    chart: { animations: { enabled: true }, sparkline: { enabled: true } },
    stroke: { width: 2 },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: (seriesName) => `#${seriesName}`
        }
      },
      marker: { show: false }
    }
  });

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" paragraph>
          {t('dashboard.statistics.product-sold-total')}
        </Typography>
        <Typography variant="h3" gutterBottom>
          {fNumber(totalSold)}
        </Typography>

        <Stack direction="row" alignItems="center" flexWrap="wrap">
          <IconWrapperStyle
            sx={{
              ...(percent < 0 && {
                color: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.16)
              })
            }}
          >
            <Icon width={16} height={16} icon={percent >= 0 ? trendingUpFill : trendingDownFill} />
          </IconWrapperStyle>

          {/* <Typography variant="subtitle2" component="span"> */}
          {/*  {percent > 0 && '+'} */}
          {/*  {fPercent(percent)} */}
          {/* </Typography> */}
          {/* <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}> */}
          {/*  &nbsp;than last week */}
          {/* </Typography> */}
        </Stack>
      </Box>

      <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} width={120} height={80} />
    </Card>
  );
}
