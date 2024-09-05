import { ChevronDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  BoxProps,
  ListItemText,
  MenuItem,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useRootStore } from 'src/store/root';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';
import { DASHBOARD } from 'src/utils/mixPanelEvents';

import { useProtocolDataContext } from '../hooks/useProtocolDataContext';
import {
  availableMarkets,
  CustomMarket,
  ENABLE_TESTNET,
  MarketDataType,
  marketsData,
  networkConfigs,
  STAGING_ENV,
} from '../utils/marketsAndNetworksConfig';
import StyledToggleButton from './StyledToggleButton';
import StyledToggleButtonGroup from './StyledToggleButtonGroup';

export const getMarketInfoById = (marketId: CustomMarket) => {
  const market: MarketDataType = marketsData[marketId as CustomMarket];
  const network: BaseNetworkConfig = networkConfigs[market.chainId];
  const logo = market.logo || network.networkLogoPath;

  return { market, logo };
};

export const getMarketHelpData = (marketName: string) => {
  const testChains = [
    'Görli',
    'Ropsten',
    'Mumbai',
    'Sepolia',
    'Fuji',
    'Testnet',
    'Kovan',
    'Rinkeby',
  ];
  const arrayName = marketName.split(' ');
  const testChainName = arrayName.filter((el) => testChains.indexOf(el) > -1);
  const marketTitle = arrayName.filter((el) => !testChainName.includes(el)).join(' ');

  return {
    name: marketTitle,
    testChainName: testChainName[0],
  };
};

export type Market = {
  marketTitle: string;
  networkName: string;
  networkLogo: string;
  selected?: boolean;
};

type MarketLogoProps = {
  size: number;
  logo: string;
  testChainName?: string;
  sx?: BoxProps;
};

export const MarketLogo = ({ size, logo, testChainName, sx }: MarketLogoProps) => {
  return (
    <Box sx={{ mr: 2, width: size, height: size, position: 'relative', ...sx }}>
      <img src={logo} alt="" width="100%" height="100%" />

      {testChainName && (
        <Tooltip title={testChainName} arrow>
          <Box
            sx={{
              bgcolor: '#29B6F6',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              color: 'common.white',
              fontSize: '12px',
              lineHeight: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: '-2px',
              bottom: '-2px',
            }}
          >
            {testChainName.split('')[0]}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

enum SelectedMarketVersion {
  V2,
  V3,
}

export const MarketSwitcher = () => {
  const { currentMarket, setCurrentMarket } = useProtocolDataContext();
  const [selectedMarketVersion, setSelectedMarketVersion] = useState<SelectedMarketVersion>(
    SelectedMarketVersion.V3
  );
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const trackEvent = useRootStore((store) => store.trackEvent);

  const isV3MarketsAvailable = availableMarkets
    .map((marketId: CustomMarket) => {
      const { market } = getMarketInfoById(marketId);

      return market.v3;
    })
    .some((item) => !!item);

  const handleMarketSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    trackEvent(DASHBOARD.CHANGE_MARKET, { market: e.target.value });
    setCurrentMarket(e.target.value as unknown as CustomMarket);
  };

  return (
    <TextField
      select
      aria-label="select market"
      data-cy="marketSelector"
      value={currentMarket}
      onChange={handleMarketSelect}
      sx={{
        mr: 2,
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      }}
      SelectProps={{
        native: false,
        className: 'MarketSwitcher__select',
        IconComponent: (props) => (
          <SvgIcon fontSize="medium" {...props}>
            <ChevronDownIcon />
          </SvgIcon>
        ),
        renderValue: (marketId) => {
          const { market, logo } = getMarketInfoById(marketId as CustomMarket);

          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarketLogo
                size={upToLG ? 32 : 28}
                logo={logo}
                testChainName={getMarketHelpData(market.marketTitle).testChainName}
              />
              <Box sx={{ mr: 1, display: 'inline-flex', alignItems: 'flex-start' }}>
                <Typography
                  variant={upToLG ? 'display1' : 'h1'}
                  sx={{
                    fontSize: downToXSM ? '1.55rem' : undefined,
                    color: 'common.white',
                    mr: 1,
                  }}
                >
                  {getMarketHelpData(market.marketTitle).name} {market.isFork ? 'Fork' : ''}
                  {upToLG && ' Market'}
                </Typography>
                {market.v3 ? (
                  <Box
                    sx={{
                      color: '#fff',
                      px: 2,
                      borderRadius: '12px',
                      background: (theme) => theme.palette.gradients.aaveGradient,
                    }}
                  >
                    <Typography variant="subheader2">V3</Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      color: '#A5A8B6',
                      px: 2,
                      borderRadius: '12px',
                      backgroundColor: '#383D51',
                    }}
                  >
                    <Typography variant="subheader2">V2</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        },
        sx: {
          '&.MarketSwitcher__select .MuiSelect-outlined': {
            pl: 0,
            py: 0,
            backgroundColor: 'transparent !important',
          },
          '.MuiSelect-icon': { color: '#F1F1F3' },
        },
        MenuProps: {
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          PaperProps: {
            style: {
              minWidth: 240,
            },
            variant: 'outlined',
            elevation: 0,
          },
        },
      }}
    >
      <Box>
        <Typography variant="subheader2" color="text.secondary" sx={{ px: 4, pt: 2 }}>
          <Trans>
            {ENABLE_TESTNET || STAGING_ENV ? 'Select Aave Testnet Market' : 'Select Aave Market'}
          </Trans>
        </Typography>
      </Box>
      {isV3MarketsAvailable && (
        <Box sx={{ mx: '18px', display: 'flex', justifyContent: 'center' }}>
          <StyledToggleButtonGroup
            value={selectedMarketVersion}
            exclusive
            onChange={(_, value) => {
              if (value !== null) {
                setSelectedMarketVersion(value);
              }
            }}
            sx={{
              width: '100%',
              height: '36px',
              background: theme.palette.primary.main,
              border: `1px solid ${
                theme.palette.mode === 'dark' ? 'rgba(235, 235, 237, 0.12)' : '#1B2030'
              }`,
              borderRadius: '6px',
              marginTop: '16px',
              marginBottom: '12px',
              padding: '2px',
            }}
          >
            <StyledToggleButton
              value={SelectedMarketVersion.V3}
              data-cy={`markets_switch_button_v3`}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#EAEBEF' : '#383D51',
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#292E41' : '#FFFFFF',
                  boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.05)',
                },
                borderRadius: '4px',
              }}
            >
              <Typography
                variant="buttonM"
                sx={
                  selectedMarketVersion === SelectedMarketVersion.V3
                    ? {
                        backgroundImage: (theme) => theme.palette.gradients.aaveGradient,
                        backgroundClip: 'text',
                        color: 'transparent',
                      }
                    : {
                        color: theme.palette.mode === 'dark' ? '#0F121D' : '#FFFFFF',
                      }
                }
              >
                <Trans>Version 3</Trans>
              </Typography>
            </StyledToggleButton>
            <StyledToggleButton
              value={SelectedMarketVersion.V2}
              data-cy={`markets_switch_button_v2`}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#EAEBEF' : '#383D51',
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#292E41' : '#FFFFFF',
                  boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.05)',
                },
                borderRadius: '4px',
              }}
            >
              <Typography
                variant="buttonM"
                sx={
                  selectedMarketVersion === SelectedMarketVersion.V2
                    ? {
                        backgroundImage: (theme) => theme.palette.gradients.aaveGradient,
                        backgroundClip: 'text',
                        color: 'transparent',
                      }
                    : {
                        color: theme.palette.mode === 'dark' ? '#0F121D' : '#FFFFFF',
                      }
                }
              >
                <Trans>Version 2</Trans>
              </Typography>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Box>
      )}
      {availableMarkets.map((marketId: CustomMarket) => {
        console.log('marketId', marketId);

        const { market, logo } = getMarketInfoById(marketId);
        const marketNaming = getMarketHelpData(market.marketTitle);
        return (
          <MenuItem
            key={marketId}
            data-cy={`marketSelector_${marketId}`}
            value={marketId}
            sx={{
              '.MuiListItemIcon-root': { minWidth: 'unset' },
              display:
                (market.v3 && selectedMarketVersion === SelectedMarketVersion.V2) ||
                (!market.v3 && selectedMarketVersion === SelectedMarketVersion.V3)
                  ? 'none'
                  : 'flex',
            }}
          >
            <MarketLogo size={32} logo={logo} testChainName={marketNaming.testChainName} />
            <ListItemText sx={{ mr: 0 }}>
              {marketNaming.name} {market.isFork ? 'Fork' : ''}
            </ListItemText>
            <ListItemText sx={{ textAlign: 'right' }}>
              <Typography color="text.muted" variant="description">
                {marketNaming.testChainName}
              </Typography>
            </ListItemText>
          </MenuItem>
        );
      })}
    </TextField>
  );
};
