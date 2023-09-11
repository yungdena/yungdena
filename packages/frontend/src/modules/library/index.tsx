import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { ButtonWrapper, PurchaseButton } from "../app-page/index.styled";
import { APP_KEYS } from "../common/consts";
import { LoaderBig } from "../common/loader/loader";
import { useGetAppById } from "../common/services/apps.service";
import { useAddToLibrary, useGetLibrary } from "../common/services/user.service";
import { IApp } from "../common/types/app.interface";
import { calculateReviewTitle } from "../common/utils/calculateReviewRate";
import { calculatePercentageDecrease } from "../common/utils/countPercentage";
import { formatDate } from "../common/utils/formatDate";
import { handleNavigate } from "../common/utils/handleNavigate";
import { Header } from "../header"
import { Footer } from "../home/footer"
import { FinalPrice, OriginalPrice, PriceAmounts, PriceContainer, PricePercent } from "../home/offers/index.styled";
import { AppPrice } from "../store/app-list/index.styled";
import { handleSearch } from "../store/app-list/utils/handlers";
import { sortAppsByDiscount, sortAppsByLowestPrice, sortAppsByName, sortAppsByReleaseDate, sortAppsByReviews } from "../store/app-list/utils/sort-apps";
import { Background, Capsule, ItemImage, ItemTitle, MainContainer, MidContainer, NicknameSpan, NoItems, SearchBar, SearchContainer, Select, SortBy, Stats, StatsLabel, Tag, TagsContainer, LibraryContainer, LibraryItem, LibraryTitle } from "./index.styled"
import { CustomSelect } from "./select/custom-select";

interface AppRouteParams {
  id: string;
}

export const Library = () => {
  const [libraryIds, setLibraryIds] = useState<string[]>([]);
  const [apps, setApps] = useState<IApp[]>([]);
  const [sortedApps, setSortedApps] = useState<IApp[]>([]);
  const [sortBy, setSortBy] = useState<string>("Your Rank");
  const [searchInput, setSearchInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const history = useHistory()
  const getLibraryMutation = useGetLibrary();
  const getAppByIdMutation = useGetAppById();
  const user = localStorage.getItem("account");

  useEffect(() => {
    async function getUserLibrary() {
      if (user) {
        const id = JSON.parse(user)._id;
        const libraryResponse = await getLibraryMutation.mutateAsync(id);
        setLibraryIds(libraryResponse.library);
      }
    }

    getUserLibrary();
  }, []);

    useEffect(() => {
      async function getAppsFromLibrary() {
        try {
          const appsResponse = await Promise.all(
            libraryIds.map((id) => getAppByIdMutation.mutateAsync(id))
          );
          setApps(appsResponse);
          setIsLoading(false); 
        } catch (error) {
          console.error("Error fetching apps from library:", error);
        }
      }

      getAppsFromLibrary();
    }, [libraryIds]);

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
          <LibraryTitle>
            {user && JSON.parse(user).name}
            <NicknameSpan>
              {">"}
              {">"} games
            </NicknameSpan>
          </LibraryTitle>
          <SearchContainer>
            <SearchBar
              onChange={(event) => {
                handleInputChange(event.target.value);
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
          <LibraryContainer>
            {isLoading ? (
              <LoaderBig marginTop="5rem" />
            ) : sortedApps.length > 0 ? (
              sortedApps.map((item) => (
                <LibraryItem key={item._id}>
                  <ItemImage src={item.titleImage} />
                  <Capsule>
                    <ItemTitle
                      onClick={() =>
                        history.push(APP_KEYS.ROUTER_KEYS.APPS + `/${item._id}`)
                      }
                    >
                      {item.title}
                    </ItemTitle>
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
                    </MidContainer>
                    <TagsContainer>
                      {item.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </TagsContainer>
                  </Capsule>
                </LibraryItem>
              ))
            ) : (
              <NoItems>No apps in your Library.</NoItems>
            )}
          </LibraryContainer>
        </MainContainer>
      </Background>
      <Footer />
    </>
  );
};