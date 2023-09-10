import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ButtonWrapper, PurchaseButton } from "../app-page/index.styled";
import { APP_KEYS } from "../common/consts";
import { useGetAppById } from "../common/services/apps.service";
import { useAddToLibrary, useGetWishlist } from "../common/services/user.service";
import { IApp } from "../common/types/app.interface";
import { calculateReviewTitle } from "../common/utils/calculateReviewRate";
import { calculatePercentageDecrease } from "../common/utils/countPercentage";
import { formatDate } from "../common/utils/formatDate";
import { handleNavigate } from "../common/utils/handleNavigate";
import { Header } from "../header"
import { Footer } from "../home/footer"
import { FinalPrice, OriginalPrice, PriceAmounts, PriceContainer, PricePercent } from "../home/offers/index.styled";
import { AppPrice } from "../store/app-list/index.styled";
import { handleSearch, handleSearchInputChange } from "../store/app-list/utils/handlers";
import { sortAppsByDiscount, sortAppsByHighestPrice, sortAppsByLowestPrice, sortAppsByName, sortAppsByReleaseDate, sortAppsByReviews } from "../store/app-list/utils/sort-apps";
import { Background, Capsule, ItemImage, ItemTitle, MainContainer, MidContainer, NoItems, SearchBar, SearchContainer, Select, SortBy, Stats, StatsLabel, Tag, TagsContainer, WishlistContainer, WishlistItem, WishlistTitle } from "./index.styled"
import { CustomSelect } from "./select/custom-select";

interface AppRouteParams {
  id: string;
}

export const Wishlist = () => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [apps, setApps] = useState<IApp[]>([]);
  const [sortedApps, setSortedApps] = useState<IApp[]>([]);
  const [sortBy, setSortBy] = useState("Your Rank");
  const [searchInput, setSearchInput] = useState<string>("");
  const getWishlistMutation = useGetWishlist();
  const getAppByIdMutation = useGetAppById();
  const user = localStorage.getItem("account");

  useEffect(() => {
    async function getUsersWishlist() {
      const user = localStorage.getItem('account');
      if (user && wishlistIds.length === 0) {
        const id = JSON.parse(user)._id;
        const wishlistResponse = await getWishlistMutation.mutateAsync(id);
        setWishlistIds(wishlistResponse.wishlist);
      }
    }

    getUsersWishlist();
  }, []);

  useEffect(() => {
    async function getAppsFromWishlist() {
      try {
        if (wishlistIds.length > 0 && apps.length === 0) {
          const appsResponse = await Promise.all(
            wishlistIds.map((id) => getAppByIdMutation.mutateAsync(id))
          );
          setApps(appsResponse);
        }
      } catch (error) {
        console.error("Error fetching apps from wishlist:", error);
      }
    }

    getAppsFromWishlist();
  }, [wishlistIds]);

  const addToLibraryMutation = useAddToLibrary();
  const handleAddToLibrary = async () => {
    const user = localStorage.getItem(APP_KEYS.STORAGE_KEYS.ACCOUNT);
    if (user) {
      const { id } = useParams<AppRouteParams>();
      const appId = id;
      const userId = JSON.parse(user)._id;
      await addToLibraryMutation.mutateAsync({ userId, appId });
      console.log("App added successfully");
    } else {
      handleNavigate(
        history,
        APP_KEYS.ROUTER_KEYS.ROOT + APP_KEYS.ROUTER_KEYS.SIGNIN
      );
    }
  };
  useEffect(() => {
    const appsCopy = [...apps];

    switch (sortBy) {
      case "Your Rank":
        break;
      case "Release Date":
        sortAppsByReleaseDate(appsCopy);
        break;
      case "Name":
        sortAppsByName(appsCopy);
        break;
      case "Price":
        sortAppsByLowestPrice(appsCopy);
        break;
      case "Review Score":
        sortAppsByReviews(appsCopy);
        break;
      case "Discount":
        sortAppsByDiscount(appsCopy);
        break;
      default:
        break;
    }

    if (searchInput) {
      const filteredApps = appsCopy.filter((app) =>
        app.title.toLowerCase().includes(searchInput.toLowerCase())
      );

      setSortedApps(filteredApps);
    } else {
      setSortedApps(appsCopy);
    }
  }, [apps, sortBy]);

  const handleSortChange = (selectedOption: string, setSortBy: any) => {
    setSortBy(selectedOption);
  };

  const handleInputChange = (inputValue: string) => {
    setSearchInput(inputValue);
    handleSearch(inputValue, setSortedApps, apps);
  };

  return (
    <>
      <Header />
      <Background>
        <MainContainer>
          <WishlistTitle>
            {user && JSON.parse(user).name}'s wishlist
          </WishlistTitle>
          <SearchContainer>
            <SearchBar
              onChange={(event) => {
                handleInputChange(event.target.value)
              }}
              placeholder="Search by name"
            />
            <CustomSelect
              onChange={(selectedOption) =>
                handleSortChange(selectedOption, setSortBy)
              }
              value={sortBy}
            />
          </SearchContainer>
          <WishlistContainer>
            {apps.length > 0 ? (
              sortedApps.map((item) => (
                <WishlistItem key={item._id}>
                  <ItemImage src={item.titleImage} />
                  <Capsule>
                    <ItemTitle>{item.title}</ItemTitle>
                    <MidContainer>
                      <Stats>
                        <StatsLabel>Overall reviews:</StatsLabel>
                        <StatsLabel
                          style={{
                            color: calculateReviewTitle(item.reviews).color,
                          }}
                        >
                          {item.reviews &&
                            calculateReviewTitle(item.reviews).title}
                          {!item.reviews && "No reviews"}
                        </StatsLabel>
                        <StatsLabel>Release Date:</StatsLabel>
                        <StatsLabel>{formatDate(item.releaseDate)}</StatsLabel>
                      </Stats>
                      <ButtonWrapper className="wishlist-wrap">
                        {item.newPrice ? (
                          <PriceContainer className="New-Price">
                            <PricePercent>
                              -
                              {calculatePercentageDecrease(
                                Number(item.price),
                                Number(item.newPrice),
                                0
                              )}
                              %
                            </PricePercent>
                            <PriceAmounts className="wishlist-price-amounts">
                              <OriginalPrice>{item.price}$</OriginalPrice>
                              <FinalPrice className="wishlist-price-final-price">
                                {item.newPrice}$
                              </FinalPrice>
                            </PriceAmounts>
                          </PriceContainer>
                        ) : (
                          <AppPrice className="wishlist-price">
                            {item.price}
                            {item.price === "Free to Play" ? "" : "$"}
                          </AppPrice>
                        )}
                        <PurchaseButton
                          className="to-cart-button"
                          onClick={handleAddToLibrary}
                        >
                          Add to Cart
                        </PurchaseButton>
                      </ButtonWrapper>
                    </MidContainer>
                    <TagsContainer>
                      {item.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </TagsContainer>
                  </Capsule>
                </WishlistItem>
              ))
            ) : (
              <NoItems>No apps in your wishlist.</NoItems>
            )}
          </WishlistContainer>
        </MainContainer>
      </Background>
      <Footer />
    </>
  );
};
