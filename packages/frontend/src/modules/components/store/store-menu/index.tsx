import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { APP_KEYS } from "../../../common/consts";
import { Tags } from "../../../common/utils/tags";
import { CheckBoxLabel, FilterContainer, FilterTitle, MainMenuContainer, PriceRangeInput, PriceRangeLabel, StyledCheckbox } from "./index.styled"

export const StoreMenu = () => {
  const [selectedPrice, setSelectedPrice] = useState<string | number>('Free');
  const [onlySpecialOffers, setIncludeFree] = useState(false);
  const [hideFree, setHideFree] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const priceOptions = ["Free", 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, "Any Price"];

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedIndex = parseInt(event.target.value, 10);
    setSelectedPrice(priceOptions[selectedIndex]);
    searchParams.set("price", String(priceOptions[selectedIndex]));
    updateURL();
  };

  const renderLabel = () => {
    if (selectedPrice === "Free" || selectedPrice === "Any Price") {
      return selectedPrice;
    } else {
      return `Under ${selectedPrice}$`;
    }
  };

  const handleIncludeFreeChange = () => {
    setIncludeFree(!onlySpecialOffers);
    searchParams.set("onlySpecialOffers", String(!onlySpecialOffers));
    updateURL();
  };

  const handleHideFreeChange = () => {
    setHideFree(!hideFree);
    searchParams.set("hideFree", String(!hideFree));
    updateURL();
  };

  const handleApplyTag = (tag: string) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter((selectedTag) => selectedTag !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    searchParams.set("tags", updatedTags.join(","));
    updateURL();
  };

  const updateURL = () => {
    const queryString = searchParams.toString();
    history.push(
      `${APP_KEYS.ROUTER_KEYS.ROOT}${APP_KEYS.ROUTER_KEYS.STORE}?${queryString}`
    );
  };

  useEffect(() => {
    searchParams.set("tags", selectedTags.join(","));
    history.push(
      `${APP_KEYS.ROUTER_KEYS.ROOT}${APP_KEYS.ROUTER_KEYS.STORE}?${searchParams}`
    );
  }, [selectedTags]);

  return (
    <MainMenuContainer>
      <FilterContainer>
        <FilterTitle>Narrow by Price</FilterTitle>
        <PriceRangeInput
          type="range"
          min={0}
          max={priceOptions.length - 1}
          step={1}
          value={priceOptions.indexOf(selectedPrice)}
          onChange={handlePriceChange}
        />
        <PriceRangeLabel>{renderLabel()}</PriceRangeLabel>
        <CheckBoxLabel>
          <StyledCheckbox
            type="checkbox"
            checked={onlySpecialOffers}
            onChange={handleIncludeFreeChange}
          />
          Special Offers
        </CheckBoxLabel>
        <CheckBoxLabel>
          <StyledCheckbox
            type="checkbox"
            checked={hideFree}
            onChange={handleHideFreeChange}
          />
          Hide Free to play items
        </CheckBoxLabel>
      </FilterContainer>
      <FilterContainer style={{ marginTop: "1rem" }}>
        <FilterTitle>Narrow by Tags</FilterTitle>
        {Object.values(Tags).map((tag) => (
          <CheckBoxLabel key={tag}>
            <StyledCheckbox
              type="checkbox"
              onClick={() => handleApplyTag(tag)}
            />
            {tag}
          </CheckBoxLabel>
        ))}
      </FilterContainer>
    </MainMenuContainer>
  );
};