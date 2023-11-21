import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useAppsData } from '../../../common/context/apps-context';
import { ContentContainer, AppsList, AppContainer, AppImage, AppImageContainer, AppTitle, AppTextContainer, AppPrice, AppLink, AppReleaseDate, AppReviews, SearchBarContainer, SearchBarInput, SearchBarButton, SearchBarSortByTitle, SearchBarSortBySelect, SearchBarOption, Dropdown } from './index.styled';
import { PriceContainer, PriceAmounts, PricePercent, OriginalPrice, FinalPrice } from '../../home/offers/index.styled';
import { IApp } from '../../../common/types/app.interface';
import { calculatePercentageDecrease } from '../../../common/utils/countPercentage';
import { LoaderBig } from '../../../common/loader/loader';
import { formatDate } from '../../../common/utils/formatDate';
import { calculateReviewTitle, getReviewImageURL } from '../../../common/utils/calculateReviewRate';
import { sortAppsByHighestPrice, sortAppsByLowestPrice, sortAppsByName, sortAppsByReleaseDate, sortAppsByReviews } from './utils/sort-apps';
import { handleNavigate, handleSearch, handleSearchInputChange, handleSortChange } from './utils/handlers';

export const AppList = ({ sliceIndex, minHeight, margin }: { sliceIndex: number | null, minHeight?: string, margin?: string }) => {
  const [sortedApps, setSortedApps] = useState<IApp[]>([]);
  const [sortBy, setSortBy] = useState("Relevance");
  const [displayedApps, setDisplayedApps] = useState<IApp[]>([]);

  const history = useHistory();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchUrl = searchParams.get("search");
  const tagsParam = searchParams.get("tags");
  const onlySpecialOffersParam = searchParams.get("onlySpecialOffers");
  const hideFreeParam = searchParams.get("hideFree");
  const priceParam = searchParams.get("price");
  const [searchInput, setSearchInput] = useState<string>(searchUrl || "");

  const { isLoadingApps, appsData, page } = useAppsData();

useEffect(() => {
  const appsCopy = [...appsData];

  switch (sortBy) {
    case "Relevance":
      break;
    case "Release date":
      sortAppsByReleaseDate(appsCopy);
      break;
    case "Name":
      sortAppsByName(appsCopy);
      break;
    case "Lowest Price":
      sortAppsByLowestPrice(appsCopy);
      break;
    case "Highest Price":
      sortAppsByHighestPrice(appsCopy);
      break;
    case "User Reviews":
      sortAppsByReviews(appsCopy);
      break;
    default:
      break;
  }

  let filteredApps = appsCopy;

  if (onlySpecialOffersParam !== null && onlySpecialOffersParam === 'true') {
    filteredApps = filteredApps.filter(
      (app) => app.newPrice
    );
  }

  if (hideFreeParam !== null && Boolean(hideFreeParam) === true) {
    const hideFree = hideFreeParam === "true";
    filteredApps = filteredApps.filter(
      (app) => !(hideFree && app.price === "Free to Play")
    );
  }

  if (priceParam !== null) {
    let filteredAppsByPrice;

    if (priceParam === "Free") {
      filteredAppsByPrice = filteredApps.filter(
        (app) => app.newPrice === "Free to Play" || app.price === "Free to Play"
      );
    } else if (priceParam === "Any Price") {
      filteredAppsByPrice = filteredApps;
    } else {
      const priceFilter = parseInt(priceParam, 10);
      filteredAppsByPrice = filteredApps.filter((app) => {
        const appPrice = app.newPrice !== undefined ? app.newPrice : app.price;
        return (
          appPrice &&
          (appPrice === "Free to Play" || Number(appPrice) < priceFilter)
        );
      });
    }
    filteredApps = filteredAppsByPrice;
  }

  if (searchInput) {
    filteredApps = filteredApps.filter((app) =>
      app.title.toLowerCase().includes(searchInput.toLowerCase())
    );
  } else if (tagsParam) {
    const tagsArray = tagsParam.split(",").map((tag) => tag.trim());
    filteredApps = filteredApps.filter((app) =>
      tagsArray.some((tag) => app.tags.includes(tag))
    );
  }

  setSortedApps(filteredApps);
}, [
  appsData,
  sortBy,
  tagsParam,
  hideFreeParam,
  priceParam,
  onlySpecialOffersParam,
  searchInput,
]);

  useEffect(() => {
    const displayedApps = sortedApps;

    setDisplayedApps(displayedApps);
  }, [page, sortedApps]);

  return (
    <ContentContainer minHeight={minHeight}>
      {isLoadingApps ? (
        <LoaderBig marginTop="10rem" marginRight="40rem" />
      ) : (
        <>
          <SearchBarContainer>
            <SearchBarInput
              onChange={(event) =>
                handleSearchInputChange(event, setSearchInput)
              }
              placeholder="enter search term or tag"
            />
            <SearchBarButton
              onClick={() => handleSearch(searchInput, setSortedApps, appsData)}
            >
              Search
            </SearchBarButton>
            <SearchBarSortByTitle>Sort by</SearchBarSortByTitle>
            <SearchBarSortBySelect
              onChange={(event) => handleSortChange(event, setSortBy)}
              value={sortBy}
            >
              <SearchBarOption>Relevance</SearchBarOption>
              <SearchBarOption>Release date</SearchBarOption>
              <SearchBarOption>Name</SearchBarOption>
              <SearchBarOption>Lowest Price</SearchBarOption>
              <SearchBarOption>Highest Price</SearchBarOption>
              <SearchBarOption>User Reviews</SearchBarOption>
            </SearchBarSortBySelect>
          </SearchBarContainer>
          <AppsList margin={margin}>
            {displayedApps
              .slice(0, sliceIndex ? sliceIndex : appsData.length)
              .map((app) => (
                <AppLink
                  key={app._id}
                  onClick={() => handleNavigate(app._id, history)}
                >
                  <AppContainer>
                    <AppImageContainer>
                      <AppImage src={app.bannerImage} />
                    </AppImageContainer>
                    <AppTextContainer>
                      <AppTitle>{app.title}</AppTitle>
                      <AppReleaseDate>
                        {formatDate(app.releaseDate)}
                      </AppReleaseDate>
                      <AppReviews
                        src={getReviewImageURL(
                          calculateReviewTitle(app.reviews).title
                        )}
                      />
                      {!app.newPrice && (
                        <AppPrice>
                          {app.price}
                          {app.price === "Free to Play" ? "" : "$"}
                        </AppPrice>
                      )}
                      {app.newPrice && (
                        <PriceContainer className="New-Price">
                          <PricePercent>
                            -
                            {calculatePercentageDecrease(
                              Number(app.price),
                              Number(app.newPrice),
                              0
                            )}
                            %
                          </PricePercent>
                          <PriceAmounts>
                            <OriginalPrice>{app.price}$</OriginalPrice>
                            <FinalPrice>{app.newPrice}$</FinalPrice>
                          </PriceAmounts>
                        </PriceContainer>
                      )}
                    </AppTextContainer>
                  </AppContainer>
                </AppLink>
              ))}
          </AppsList>
        </>
      )}
    </ContentContainer>
  );
};
