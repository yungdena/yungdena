import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { APP_KEYS } from "../../common/consts";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";

import { Header } from "../header";
import {
  AppsLine,
  ContentContainer,
  FeaturedButton,
  FeaturedTitle,
  HomeAppsContainer,
  MainBanner,
  MainContainer,
  StyledPagination,
  WishlistButton,
} from "./index.styled";
import { GameBannerComponent } from "./banner";
import { HomepageHeader } from "./home-header";
import { Footer } from "./footer";
import { Offers } from "./offers";
import { LoaderBig } from "../../common/loader/loader";
import { AppContainer, AppImage, AppImageContainer, AppLink, AppPrice, AppReleaseDate, AppReviews, AppTextContainer, AppTitle } from "../store/app-list/index.styled";
import { FinalPrice, OriginalPrice, PriceAmounts, PriceContainer, PricePercent } from "./offers/index.styled";
import { calculatePercentageDecrease } from "../../common/utils/countPercentage";
import { calculateReviewTitle, getReviewImageURL } from "../../common/utils/calculateReviewRate";
import { formatDate } from "../../common/utils/formatDate";
import { useAppsData } from "../../common/context/apps-context";
import { useBannersData } from "../../common/context/banners-context";
import { useUserData } from "../../common/context/user-context";
import SearchApps from "./search-dropdown";
import { IApp } from "../../common/types/app.interface";

export const HomePage = () => {
  const [filteredApps, setFilteredApps] = useState<IApp[] | null>(null)
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoadingApps, appsData } = useAppsData();
  const { isLoadingBanners, bannersData } = useBannersData();
  const history = useHistory();
  const UserDataContext = useUserData();

  const swiperParams = {
    modules: [EffectFade, Autoplay, Navigation, Pagination],
    effect: "fade",
    navigation: true,
    slidesPerView: 1,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    className: "swiper",
  };

  const handleNavigate = (appId: string) => {
    console.log('handleNavigate', appId);
    history.push(
      `${APP_KEYS.ROUTER_KEYS.ROOT}${APP_KEYS.ROUTER_KEYS.APPS}/${appId}`
    );
  };

  const handleNavigateToApps = () => {
    history.push(
      `${APP_KEYS.ROUTER_KEYS.ROOT}${APP_KEYS.ROUTER_KEYS.STORE}`
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredApps = appsData.filter((app) =>
      app.title.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredApps(filteredApps);
  };

  return (
    <>
      <Header />
      <MainBanner />
      <MainContainer>
        <ContentContainer>
          <WishlistButton
            onClick={() =>
              history.push(
                `${APP_KEYS.ROUTER_KEYS.ROOT}${APP_KEYS.ROUTER_KEYS.WISHLIST}`
              )
            }
          >
            Wishlist ({UserDataContext?.userData?.wishlist.length})
          </WishlistButton>
          <HomepageHeader onSearch={handleSearch} />
          <SearchApps apps={filteredApps} searchQuery={searchQuery} />
          {isLoadingBanners ? (
            <LoaderBig marginTop="40rem" marginBottom="10rem" />
          ) : (
            <>
              <FeaturedTitle left="60px" top="33rem">
                FEATURED & RECOMMENDED
              </FeaturedTitle>
              <Swiper style={{ marginTop: "21rem" }} {...swiperParams}>
                {bannersData.map((banner) => (
                  <SwiperSlide key={banner._id} className="banner-slide">
                    <GameBannerComponent
                      onClick={handleNavigateToApps}
                      appInfo={banner}
                    />
                  </SwiperSlide>
                ))}
                <StyledPagination>
                  <div className="swiper-pagination"></div>
                </StyledPagination>
              </Swiper>
            </>
          )}
          {isLoadingApps ? (
            <LoaderBig marginTop="20rem" marginBottom="10rem" />
          ) : (
            <Offers appsArray={appsData} />
          )}

          {isLoadingApps ? (
            <LoaderBig marginTop="10rem" marginBottom="10rem" />
          ) : (
            <>
              <AppsLine>
                <FeaturedTitle left="0" top="-20px">
                  Top Sellers
                </FeaturedTitle>
                <FeaturedButton onClick={handleNavigateToApps}>
                  To apps
                </FeaturedButton>
              </AppsLine>
              <HomeAppsContainer>
                {appsData.slice(0, 5).map((app) => (
                  <AppLink
                    key={app._id}
                    onClick={() => handleNavigate(app._id)}
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
                          <PriceContainer
                            style={{ marginTop: "3px" }}
                            className="New-Price"
                          >
                            <PricePercent style={{ marginLeft: "4px" }}>
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
              </HomeAppsContainer>
            </>
          )}
        </ContentContainer>
      </MainContainer>
      <Footer />
    </>
  );
};