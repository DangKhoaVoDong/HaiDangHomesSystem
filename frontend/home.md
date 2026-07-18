import { DestinationHighlightsSection } from "./DestinationHighlightsSection";
import { HeroBannerSection } from "./HeroBannerSection";
import { PrimaryNavigationSection } from "./PrimaryNavigationSection";
import { SiteFooterSection } from "./SiteFooterSection";

export const HaidangHomeUpdated = (): JSX.Element => {
  return (
    <main className="bg-[linear-gradient(0deg,rgba(252,249,248,1)_0%,rgba(252,249,248,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] w-full min-w-[1280px] min-h-[2348px] flex flex-col">
      <PrimaryNavigationSection />
      <HeroBannerSection />
      <DestinationHighlightsSection />
      <SiteFooterSection />
    </main>
  );
};

export default HaidangHomeUpdated;
import { useId, useMemo, useState } from "react";
import icon10 from "./icon-10.svg";
import icon11 from "./icon-11.svg";
import icon12 from "./icon-12.svg";
import icon13 from "./icon-13.svg";

type Brand = {
  id: string;
  label: string;
};

type City = {
  id: string;
  label: string;
};

type District = {
  id: string;
  label: string;
};

type Property = {
  id: string;
  name: string;
  price: string;
  brand: string;
  district: string;
  city: string;
  imageClassName: string;
  ctaIcon: string;
  ctaSplit?: boolean;
  titlePaddingClassName?: string;
  ctaClassName?: string;
  ctaGapClassName?: string;
  cardPaddingClassName?: string;
};

const brands: Brand[] = [
  { id: "all", label: "Tất Cả Thương Hiệu" },
  { id: "signature", label: "SIGNATURE" },
  { id: "savvy", label: "SAVVY" },
  { id: "m-hotel-premier", label: "M HOTEL PREMIER" },
  { id: "express-by-m-village", label: "EXPRESS BY M VILLAGE" },
];

const cities: City[] = [
  { id: "ho-chi-minh", label: "HỒ CHÍ MINH" },
  { id: "ha-noi", label: "HÀ NỘI" },
  { id: "da-nang", label: "ĐÀ NẴNG" },
  { id: "hoi-an", label: "HỘI AN" },
  { id: "da-lat", label: "ĐÀ LẠT" },
];

const districts: District[] = [
  { id: "all", label: "Tất Cả" },
  { id: "quan-3", label: "Quận 3" },
  { id: "quan-1", label: "Quận 1" },
  { id: "binh-thanh", label: "Bình Thạnh" },
  { id: "phu-nhuan", label: "Phú Nhuận" },
  { id: "quan-7", label: "Quận 7" },
];

const properties: Property[] = [
  {
    id: "savvy-boutique-hai-ba-trung",
    name: "Savvy Boutique Hai Bà Trưng",
    price: "từ 1.450.000đ · mỗi đêm",
    brand: "SAVVY",
    district: "Quận 3",
    city: "HỒ CHÍ MINH",
    imageClassName:
      "bg-[url(/ab6axuc-gcfu1mcfikxtmiw42tli2vq2hd6yvtlwz66qshqlvxnjdo5q6qtcjjfjbtavbsie4zkxkeibikco2cjjhkbjvxkepkf0t1w-fvlmaomtx5-wnprfsz2romw1wa3fl-dvhnftuvmq7yw54xlkyihlkjysumus0poii4odvv0bgkln5f64ir7ltuq3jsu-6ylic3wiax5egwk9w8pa1m9zpihbvvhdf75tnlxhnjpdbiuqfez2ukfdtw.png)]",
    ctaIcon: icon11,
    ctaSplit: true,
    titlePaddingClassName: "pl-0 pr-[19.87px] py-0",
    ctaClassName: "gap-[12.15px] pl-[8.16px] pr-0 py-0",
  },
  {
    id: "m-premier-sky-garden",
    name: "M Premier Sky Garden",
    price: "từ 2.380.000đ · mỗi đêm",
    brand: "M PREMIER",
    district: "Quận 1",
    city: "HỒ CHÍ MINH",
    imageClassName:
      "bg-[url(/ab6axubbxolrwrgmdsnq-38kzzbdiqrjjeb6krdmxio9oiao76xthbgdm1muy4nrzayv7ocvrogdstkz5xnmzdd2vnyrypro6yuuypifyy-kexioogrsut8foxsbxeyi39outgsquhhokpyhrh56fdthuuzgssl-1zaqmfglkoy0ikrgxjhcacgbs5frlje-w-ikvajy9s0-ovqf0co-apz7ghzkjsw3r4iwhfm2gk2tx12eikd6isx7ze4myw.png)]",
    ctaIcon: icon12,
    cardPaddingClassName: "pt-0 pb-[22.5px] px-0",
    ctaClassName: "gap-[3.99px]",
  },
  {
    id: "signature-maison-saigon",
    name: "Signature Maison Saigon",
    price: "từ 3.120.000đ · mỗi đêm",
    brand: "SIGNATURE",
    district: "Quận 2",
    city: "HỒ CHÍ MINH",
    imageClassName:
      "bg-[url(/ab6axubo9iclxyyc8jrxcgl1bkmgpozryyvoht-tci6sponvdsyobdcxxfrnc5tfljup-lofqwtapsvacypjaiconytwucr1gp4yhne3fpz8gqedw5gcuz4ttdqtdo-AJYF-qeirl1mdv5tyo8tfqvgbq5ejs8mr3qvlz8hmntmhkyjridzrciu9hop30elb-5uan9ai3k3snvm3ngjwnbhqsmfwrijvdwrfjq0elcjcsa-iy83fhcgwyqm-bq.png)]",
    ctaIcon: icon13,
    ctaSplit: true,
    titlePaddingClassName: "pl-0 pr-[50.72px] py-0",
    ctaClassName: "gap-[16.2px] pr-[8.53e-14px] pl-[12.2px] py-0",
  },
];

export const DestinationHighlightsSection = (): JSX.Element => {
  const sectionTitleId = useId();
  const cityTabsLabelId = useId();
  const districtTabsLabelId = useId();

  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("ho-chi-minh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  const visibleProperties = useMemo(() => {
    return properties.filter((property) => {
      const brandMatch =
        selectedBrand === "all" ||
        property.brand.toLowerCase() ===
          brands
            .find((brand) => brand.id === selectedBrand)
            ?.label.toLowerCase();
      const cityMatch =
        property.city ===
        cities.find((city) => city.id === selectedCity)?.label;
      const districtMatch =
        selectedDistrict === "all" ||
        property.district ===
          districts.find((district) => district.id === selectedDistrict)?.label;

      return brandMatch && cityMatch && districtMatch;
    });
  }, [selectedBrand, selectedCity, selectedDistrict]);

  return (
    <section
      aria-labelledby={sectionTitleId}
      className="flex flex-1 max-h-[1102px] relative flex-col w-[1280px] items-start px-0 py-[100px] bg-white"
    >
      <div className="flex flex-col max-w-screen-xl items-start gap-16 px-16 py-0 relative w-full flex-[0_0_auto]">
        <div className="grid grid-cols-12 grid-rows-[271px] h-fit gap-6 w-full">
          <div className="relative row-[1_/_2] col-[1_/_8] [align-self:end] w-full h-fit flex flex-col items-start gap-4">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#d24a15] text-[10px] tracking-[3.00px] leading-[15px]">
                — ĐIỂM ĐẾN 002
              </div>
            </div>
            <div className="items-start flex flex-col relative self-stretch w-full flex-[0_0_auto]">
              <h2
                id={sectionTitleId}
                className="relative self-stretch mt-[-1.00px] [font-family:'Playfair_Display-SemiBold',Helvetica] font-semibold text-transparent text-[64px] tracking-[0] leading-[80px]"
              >
                <span className="text-[#1c1b1b]">
                  Những điểm lưu trú
                  <br />
                  chọn lọc khắp{" "}
                </span>
                <span className="text-[#d24a15]">
                  Việt
                  <br />
                  Nam.
                </span>
              </h2>
            </div>
          </div>
          <div className="relative row-[1_/_2] col-[8_/_13] [align-self:end] w-full h-fit flex flex-col items-start">
            <p className="relative w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#594139] text-sm tracking-[0] leading-[22.8px]">
              Từ những ngôi nhà phố di sản trong khu phố cổ Hà Nội đến những khu
              <br />
              nghỉ dưỡng giữa rừng thông Đà Lạt — mỗi điểm đến đều được tuyển
              <br />
              chọn kỹ lưỡng và đặc biệt riêng.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-12 grid-rows-[567px] h-fit gap-6 w-full">
          <aside className="relative row-[1_/_2] col-[1_/_4] w-full h-fit flex flex-col items-start gap-8 pt-0 pb-[53px] px-0">
            <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
              <div className="items-start flex flex-col relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#594139] text-[11px] tracking-[1.10px] leading-[16.5px]">
                  THƯƠNG HIỆU
                </div>
              </div>
              <div
                className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] border-t [border-top-style:solid] border-[#e2bfb54c]"
                role="radiogroup"
                aria-label="Lọc theo thương hiệu"
              >
                {brands.map((brand, index) => {
                  const isSelected = selectedBrand === brand.id;

                  if (index === 0) {
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedBrand(brand.id)}
                        className="flex items-center justify-between px-0 py-4 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#e2bfb54c] text-left"
                      >
                        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                          <div
                            className={`relative flex items-center w-fit mt-[-1.00px] text-xs tracking-[0] leading-4 whitespace-nowrap ${
                              isSelected
                                ? "[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#1c1b1b]"
                                : "[font-family:'Inter-Regular',Helvetica] font-normal text-[#594139]"
                            }`}
                          >
                            {brand.label}
                          </div>
                        </div>
                        <div
                          className={`relative w-1 h-1 rounded-full ${
                            isSelected ? "bg-[#d24a15]" : "bg-transparent"
                          }`}
                        />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={brand.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedBrand(brand.id)}
                      className="flex flex-col items-start pt-[21.5px] pb-[18.5px] px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#e2bfb54c] text-left"
                    >
                      <div
                        className={`relative flex items-center w-fit mt-[-1.00px] text-xs tracking-[0.60px] leading-4 whitespace-nowrap ${
                          isSelected
                            ? "[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#1c1b1b]"
                            : "[font-family:'Inter-Regular',Helvetica] font-normal text-[#594139]"
                        }`}
                      >
                        {brand.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 p-6 relative self-stretch w-full flex-[0_0_auto] bg-[#f0edec] rounded-xl">
              <div className="items-start flex flex-col relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#d24a15] text-[11px] tracking-[1.10px] leading-[16.5px]">
                  ƯU ĐÃI HỘI VIÊN
                </div>
              </div>
              <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#594139] text-xs tracking-[0] leading-[19.5px]">
                  Hội viên thân thiết được giảm đến 20%
                  <br />
                  mức giá linh hoạt tốt nhất, kèm trà
                  <br />
                  phòng muộn miễn phí.
                </p>
              </div>
              <button
                type="button"
                className="gap-1 pt-[7.5px] pb-0 px-0 flex-[0_0_auto] inline-flex items-center relative"
                aria-label="Đăng ký miễn phí"
              >
                <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#1c1b1b] text-[11px] text-center tracking-[1.10px] leading-[16.5px] whitespace-nowrap">
                  ĐĂNG KÝ MIỄN PHÍ
                </div>
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <img
                    className="relative w-[6.5px] h-[6.5px]"
                    alt=""
                    aria-hidden="true"
                    src={icon10}
                  />
                </div>
              </button>
            </div>
          </aside>
          <div className="relative row-[1_/_2] col-[4_/_13] w-full h-fit flex flex-col items-start gap-8">
            <div className="flex flex-col items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
              <div
                className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]"
                role="tablist"
                aria-labelledby={cityTabsLabelId}
              >
                <span id={cityTabsLabelId} className="sr-only">
                  Chọn thành phố
                </span>
                {cities.map((city) => {
                  const isSelected = selectedCity === city.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedCity(city.id);
                        setSelectedDistrict("all");
                      }}
                      className={
                        isSelected
                          ? "flex-col justify-center pt-[8.5px] pb-[9px] px-6 flex-[0_0_auto] bg-[#1c1b1b] rounded-full inline-flex items-center relative"
                          : "inline-flex flex-col items-center justify-center px-6 py-2 relative flex-[0_0_auto] rounded-full border border-solid border-[#e2bfb5]"
                      }
                    >
                      <div
                        className={`relative flex items-center justify-center w-fit text-[11px] text-center tracking-[1.10px] leading-[16.5px] whitespace-nowrap [font-family:'Inter-SemiBold',Helvetica] font-semibold ${
                          isSelected
                            ? "mt-[-1.00px] text-white"
                            : "text-[#594139]"
                        }`}
                      >
                        {city.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-0 pb-4 px-0 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#e2bfb54c]">
                <div
                  className="inline-flex items-start gap-6 relative flex-[0_0_auto] overflow-scroll"
                  role="tablist"
                  aria-labelledby={districtTabsLabelId}
                >
                  <span id={districtTabsLabelId} className="sr-only">
                    Chọn khu vực
                  </span>
                  {districts.map((district) => {
                    const isSelected = selectedDistrict === district.id;
                    const isAll = district.id === "all";

                    if (isAll) {
                      return (
                        <div
                          key={district.id}
                          className="relative w-[34.66px] h-[32.5px]"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => setSelectedDistrict(district.id)}
                            className={`flex-col justify-center pt-[7.5px] px-0 inline-flex items-center relative ${
                              isSelected
                                ? "pb-6 border-b-2 [border-bottom-style:solid] border-[#d24a15]"
                                : "pb-4"
                            }`}
                          >
                            <div
                              className={`relative flex items-center justify-center w-fit text-[11px] text-center tracking-[0] leading-[16.5px] whitespace-nowrap [font-family:'Inter-SemiBold',Helvetica] font-semibold ${
                                isSelected
                                  ? "mt-[-2.00px] text-[#1c1b1b]"
                                  : "mt-[-1.00px] text-[#594139]"
                              }`}
                            >
                              {district.label}
                            </div>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={district.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setSelectedDistrict(district.id)}
                        className={`flex-col justify-center pt-0 px-0 flex-[0_0_auto] inline-flex items-center relative ${
                          isSelected
                            ? "pb-4 border-b-2 [border-bottom-style:solid] border-[#d24a15]"
                            : "pb-4"
                        }`}
                      >
                        <div
                          className={`relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[11px] text-center tracking-[0] leading-[16.5px] whitespace-nowrap ${
                            isSelected ? "text-[#1c1b1b]" : "text-[#594139]"
                          }`}
                        >
                          {district.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                  <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#594139] text-[10px] tracking-[1.00px] leading-[15px] whitespace-nowrap">
                    {visibleProperties.length} ĐIỂM LƯU TRÚ · SẮP XẾP THEO NỔI
                    BẬT
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
              {visibleProperties.map((property) => (
                <article
                  key={property.id}
                  className={`flex flex-col items-start relative flex-1 grow ${
                    property.cardPaddingClassName ?? ""
                  }`}
                >
                  <div className="flex pt-0 pb-4 px-0 self-stretch w-full flex-[0_0_auto] z-[1] flex-col items-start relative">
                    <div className="flex flex-col items-start justify-center relative self-stretch w-full flex-[0_0_auto] rounded-xl overflow-hidden aspect-[0.8]">
                      <div
                        className={`relative self-stretch w-full h-[337.5px] ${property.imageClassName} bg-cover bg-[50%_50%]`}
                      />
                      <div className="inline-flex items-center gap-2 px-3 py-1 absolute left-4 bottom-4 bg-[#ffffffe6] rounded-full backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)]">
                        <div className="relative w-1.5 h-1.5 bg-[#d24a15] rounded-full" />
                        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                          <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#1c1b1b] text-[9px] tracking-[0.90px] leading-[13.5px] whitespace-nowrap">
                            {property.brand}
                          </div>
                        </div>
                      </div>
                      <div className="inline-flex flex-col items-start absolute top-4 right-4">
                        <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-[10px] tracking-[1.00px] leading-[15px] whitespace-nowrap"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] z-0">
                    <div className="flex flex-col items-start pt-0 pb-1 px-0 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
                        <div
                          className={`inline-flex flex-col items-start relative flex-[0_0_auto] ${
                            property.titlePaddingClassName ?? ""
                          }`}
                        >
                          <div
                            className={`relative w-fit mt-[-1.00px] [font-family:'Playfair_Display-Regular',Helvetica] font-normal text-[#1c1b1b] text-lg tracking-[0] leading-[22.5px] ${
                              property.ctaSplit ? "" : "whitespace-nowrap"
                            }`}
                          >
                            {property.ctaSplit ? <br /> : property.name}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`flex-[0_0_auto] inline-flex items-center relative ${
                            property.ctaClassName ?? ""
                          }`}
                          aria-label={`Đặt ngay ${property.name}`}
                        >
                          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#d24a15] text-[10px] text-center tracking-[1.00px] leading-[15px] whitespace-nowrap">
                            {property.ctaSplit ? (
                              <>
                                ĐẶT
                                <br />
                                NGAY
                              </>
                            ) : (
                              "ĐẶT NGAY"
                            )}
                          </div>
                          <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                            <img
                              className="relative w-[7.58px] h-[7.58px]"
                              alt=""
                              aria-hidden="true"
                              src={property.ctaIcon}
                            />
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                      <p className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#594139] text-[11px] tracking-[0] leading-[16.5px]">
                        {property.price}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
import { useId, useMemo, useState } from "react";
import icon from "./icon.svg";
import icon2 from "./icon-2.svg";
import icon3 from "./icon-3.svg";
import icon4 from "./icon-4.svg";
import icon5 from "./icon-5.svg";
import icon6 from "./icon-6.svg";
import icon7 from "./icon-7.svg";
import icon8 from "./icon-8.svg";
import icon9 from "./icon-9.svg";
import image1 from "./image.png";
import image from "./image.svg";

export const HeroBannerSection = (): JSX.Element => {
  const [selectedCategory, setSelectedCategory] = useState("KHÁCH SẠN & VILLA");

  const categories = useMemo(
    () => ["KHÁCH SẠN & VILLA", "LƯU TRÚ DÀI HẠN", "TRẢI NGHIỆM"],
    [],
  );

  const locationId = useId();
  const checkInId = useId();
  const checkOutId = useId();
  const guestsId = useId();

  const bookingFields = useMemo(
    () => [
      {
        id: locationId,
        label: "ĐỊA ĐIỂM",
        value: "Đà Lạt",
        subValue: "Lâm Đồng, Việt Nam",
        iconSrc: icon,
        iconClassName: "relative w-[10.67px] h-[13.33px]",
        chevronSrc: image,
        valueWidthClassName: "w-[46.06px]",
        containerWidthClassName: "w-[212.33px]",
        bordered: true,
      },
      {
        id: checkInId,
        label: "NHẬN PHÒNG",
        value: "T4, 3 Th06",
        subValue: "2026",
        iconSrc: icon2,
        iconClassName: "relative w-3 h-[13.33px]",
        chevronSrc: icon3,
        valueWidthClassName: "w-[78.53px]",
        containerWidthClassName: "w-[212.34px]",
        bordered: true,
      },
      {
        id: checkOutId,
        label: "TRẢ PHÒNG",
        value: "T5, 4 Th06",
        subValue: "2026",
        iconSrc: icon4,
        iconClassName: "relative w-3 h-[13.33px]",
        chevronSrc: icon5,
        valueWidthClassName: "w-[79.33px]",
        containerWidthClassName: "w-[212.33px]",
        bordered: true,
      },
      {
        id: guestsId,
        label: "KHÁCH",
        value: "2 Khách",
        subValue: "1 Phòng",
        iconSrc: icon6,
        iconClassName: "relative w-[10.67px] h-[10.67px]",
        chevronSrc: icon7,
        valueWidthClassName: "w-[59.41px]",
        containerWidthClassName: "w-[211.33px]",
        bordered: false,
      },
    ],
    [locationId, checkInId, checkOutId, guestsId],
  );

  return (
    <section
      className="flex flex-1 max-h-[900px] relative flex-col w-[1280px] h-[900px] items-center justify-end pt-0 pb-12 px-0"
      aria-label="Hero banner"
    >
      <div className="flex flex-col w-full h-full items-start justify-center absolute top-0 left-0">
        <img
          className="relative flex-1 self-stretch w-full grow object-cover"
          alt="The Valley Retreat"
          src={image1}
        />
        <div
          className="absolute w-full h-full top-0 left-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.3)_100%)]"
          aria-hidden="true"
        />
      </div>
      <header className="flex max-w-screen-xl w-full items-center justify-between px-16 py-0 absolute top-12 left-0">
        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
          <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#ffffffcc] text-[10px] tracking-[3.00px] leading-[15px] whitespace-nowrap">
            N 11°56&#39; — E 108°26&#39;
          </p>
        </div>
        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
          <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#ffffffcc] text-[10px] tracking-[3.00px] leading-[15px] whitespace-nowrap">
            CHAPTER 01 — THE VALLEY
          </p>
        </div>
      </header>
      <div className="flex pt-32 pb-16 px-0 self-stretch w-full flex-[0_0_auto] flex-col items-start relative">
        <div className="flex flex-col max-w-screen-xl items-start gap-6 px-16 py-0 relative w-full flex-[0_0_auto]">
          <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#ffffffe6] text-xs text-center tracking-[3.60px] leading-4 whitespace-nowrap">
              — BỘ SƯU TẬP SIGNATURE —
            </p>
          </div>
          <div className="items-center shadow-[0px_10px_8px_#0000000a,0px_4px_3px_#0000001a] flex flex-col relative self-stretch w-full flex-[0_0_auto]">
            <h1 className="relative w-fit mt-[-1.00px] [font-family:'Playfair_Display-SemiBoldItalic',Helvetica] font-semibold italic text-white text-[110px] text-center tracking-[0] leading-[121px]">
              The Valley
              <br />
              Retreat
            </h1>
          </div>
          <div className="flex flex-col items-center pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#ffffffe6] text-xs text-center tracking-[3.60px] leading-4 whitespace-nowrap">
              BỞI HAIDANG HOME · ĐÀ LẠT, VIỆT NAM
            </p>
          </div>
        </div>
      </div>
      <div className="items-start px-[90px] py-0 self-stretch flex flex-col relative w-full flex-[0_0_auto]">
        <div className="max-w-[1100px] items-center flex flex-col relative w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start pt-0 pb-6 px-0 relative flex-[0_0_auto]">
            <div
              className="inline-flex items-start p-1 relative flex-[0_0_auto] bg-[#ffffff33] rounded-full border border-solid border-[#ffffff4c] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]"
              role="tablist"
              aria-label="Loại hình lưu trú"
            >
              {categories.map((category) => {
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setSelectedCategory(category)}
                    className={`box-border flex-col justify-center px-6 py-2 flex-[0_0_auto] rounded-full inline-flex items-center relative ${
                      isSelected ? "bg-white" : ""
                    }`}
                  >
                    <div
                      className={`relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[11px] text-center tracking-[1.10px] leading-[16.5px] whitespace-nowrap ${
                        isSelected ? "text-[#1c1b1b]" : "text-white"
                      }`}
                    >
                      {category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <form
            className="flex items-center p-2 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-full"
            aria-label="Tìm phòng"
          >
            <div
              className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-full shadow-[0px_25px_50px_-12px_#00000040]"
              aria-hidden="true"
            />
            {bookingFields.map((field) => (
              <button
                key={field.id}
                type="button"
                aria-labelledby={`${field.id}-label ${field.id}-value`}
                className={`flex flex-col ${field.containerWidthClassName} items-start px-6 py-3 relative text-left ${
                  field.bordered
                    ? "border-r [border-right-style:solid] border-[#e2bfb54c]"
                    : ""
                }`}
              >
                <div className="flex flex-col items-start pt-0 pb-1 px-0 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                      <img
                        className={field.iconClassName}
                        alt=""
                        src={field.iconSrc}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                      <div
                        id={`${field.id}-label`}
                        className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#594139] text-[11px] tracking-[0.55px] leading-[16.5px] whitespace-nowrap"
                      >
                        {field.label}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                  <div
                    className={`relative ${field.valueWidthClassName} h-[22.5px]`}
                  >
                    <div
                      id={`${field.id}-value`}
                      className="absolute -top-px left-0 h-[23px] flex items-center [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#1c1b1b] text-[15px] tracking-[0] leading-[22.5px] whitespace-nowrap"
                    >
                      {field.value}
                    </div>
                  </div>
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <img
                      className="relative w-[9px] h-[5.55px]"
                      alt=""
                      src={field.chevronSrc}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="flex pt-1 pb-0 px-0 self-stretch w-full flex-[0_0_auto] flex-col items-start relative">
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#594139] text-xs tracking-[0] leading-[18px]">
                      {field.subValue}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="submit"
              className="box-border justify-center px-10 py-5 flex-[0_0_auto] bg-[#d24a15] rounded-full inline-flex items-center relative"
              aria-label="Tìm phòng"
            >
              <div
                className="absolute w-full h-full top-0 left-0 bg-[#ffffff01] rounded-full shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]"
                aria-hidden="true"
              />
              <div className="inline-flex pl-0 pr-2 py-0 flex-[0_0_auto] flex-col items-start relative">
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <img
                    className="relative w-[15px] h-[15px]"
                    alt=""
                    src={icon8}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-base text-center tracking-[0.80px] leading-6 whitespace-nowrap">
                TÌM PHÒNG
              </div>
              <div className="inline-flex pl-2 pr-0 py-0 flex-[0_0_auto] flex-col items-start relative">
                <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
                  <img
                    className="relative w-[13.33px] h-[13.33px]"
                    alt=""
                    src={icon9}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
import icon14 from "./icon-14.svg";

const navigationItems = [
  { label: "Đặt Phòng", href: "#" },
  { label: "Về Chúng Tôi", href: "#" },
  { label: "Khách Hàng Thân Thiết", href: "#" },
  { label: "Dịch Vụ Doanh Nghiệp", href: "#" },
];

export const PrimaryNavigationSection = (): JSX.Element => {
  return (
    <header className="flex flex-1 max-h-[67px] relative flex-col w-[1280px] items-start bg-[#fcf9f8] border-b [border-bottom-style:solid] border-[#e2bfb54c]">
      <div className="flex max-w-screen-xl items-center justify-between px-16 py-3 relative w-full flex-[0_0_auto]">
        <a
          href="#"
          aria-label="Haidang Home Lifestyle"
          className="inline-flex items-center gap-2 relative flex-[0_0_auto]"
        >
          <div className="flex w-10 h-10 items-center justify-center relative rounded-full border border-solid border-[#d24a15]">
            <div className="relative w-4 h-4 bg-[#d24a15] rounded-full" />
          </div>
          <div className="relative w-[145.08px] h-[31.8px]">
            <div className="flex flex-col w-full items-start pt-0 pb-[0.8px] px-0 absolute -top-px left-0">
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#1c1b1b] text-sm tracking-[2.80px] leading-[16.8px] whitespace-nowrap">
                HAIDANG HOME
              </div>
            </div>
            <div className="flex flex-col w-full items-start absolute top-[17px] left-0">
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#594139] text-[10px] tracking-[3.00px] leading-[15px] whitespace-nowrap">
                LIFESTYLE
              </div>
            </div>
          </div>
        </a>
        <nav
          aria-label="Primary navigation"
          className="inline-flex items-center gap-8 relative flex-[0_0_auto]"
        >
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="inline-flex flex-col items-start relative flex-[0_0_auto]"
            >
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#594139] text-base tracking-[0] leading-6 whitespace-nowrap">
                {item.label}
              </div>
            </a>
          ))}
        </nav>
        <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
          <button
            type="button"
            aria-label="Select language, current language Vietnamese"
            className="gap-2 px-4 py-2 flex-[0_0_auto] rounded-full border border-solid border-[#e2bfb5] inline-flex items-center relative bg-transparent"
          >
            <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'FreeSans-Regular',Helvetica] font-normal text-[#1c1b1b] text-lg text-center tracking-[0] leading-[18px] whitespace-nowrap">
                🇻🇳
              </div>
            </div>
            <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#594139] text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                VIE
              </div>
            </div>
            <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
              <img className="relative w-2 h-[4.93px]" alt="" src={icon14} />
            </div>
          </button>
          <button
            type="button"
            className="all-unset box-border inline-flex flex-col items-center justify-center px-6 py-2 relative flex-[0_0_auto] rounded-full border border-solid border-[#e2bfb5]"
          >
            <div className="relative flex items-center justify-center w-fit [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#1c1b1b] text-sm text-center tracking-[0.70px] leading-[16.8px] whitespace-nowrap">
              ĐĂNG NHẬP
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
const footerLinks = [
  { label: "PRIVACY POLICY", href: "#" },
  { label: "TERMS OF SERVICE", href: "#" },
  { label: "SUSTAINABILITY", href: "#" },
  { label: "PRESS", href: "#" },
  { label: "CONTACT US", href: "#" },
];

export const SiteFooterSection = (): JSX.Element => {
  return (
    <footer
      className="grid flex-1 max-h-[279px] relative grid-cols-12 grid-rows-[74px_53px] w-[1280px] h-fit gap-6 p-16 bg-[#1c1b1b]"
      aria-label="Site footer"
    >
      <div className="row-[1_/_2] col-[1_/_13] w-full h-fit flex pt-0 pb-8 px-0 flex-col items-start relative">
        <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Playfair_Display-Regular',Helvetica] font-normal text-white text-[28px] tracking-[2.80px] leading-[42px]">
            HAIDANG HOME
          </div>
        </div>
      </div>
      <div className="relative row-[2_/_3] col-[1_/_13] w-full h-[53px] flex items-center justify-between pt-8 pb-0 px-0 border-t [border-top-style:solid] border-[#ffffff1a]">
        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
          <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#e5e2e1b2] text-sm tracking-[0] leading-5 whitespace-nowrap">
            © 2024 HAIDANG HOME. All Rights Reserved.
          </p>
        </div>
        <nav
          className="inline-flex items-start gap-8 relative flex-[0_0_auto]"
          aria-label="Footer navigation"
        >
          {footerLinks.map((link) => (
            <div
              key={link.label}
              className="inline-flex flex-col items-start relative self-stretch flex-[0_0_auto]"
            >
              <a
                href={link.href}
                className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#e5e2e1b2] text-xs tracking-[0.60px] leading-4 whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm"
              >
                {link.label}
              </a>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
};
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  corePlugins: { preflight: true },
  theme: { extend: {} },
  plugins: [],
};
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  button,
  input,
  select,
  textarea {
    @apply appearance-none bg-transparent border-0 outline-none;
  }
}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  .all-unset {
    all: unset;
  }
}

:root {
  --animate-spin: spin 1s linear infinite;
}

.animate-fade-in {
  animation: fade-in 1s var(--animation-delay, 0s) ease forwards;
}

.animate-fade-up {
  animation: fade-up 1s var(--animation-delay, 0s) ease forwards;
}

.animate-marquee {
  animation: marquee var(--duration) infinite linear;
}

.animate-marquee-vertical {
  animation: marquee-vertical var(--duration) linear infinite;
}

.animate-shimmer {
  animation: shimmer 8s infinite;
}

.animate-spin {
  animation: var(--animate-spin);
}

@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}

@keyframes image-glow {
  0% {
    opacity: 0;
    animation-timing-function: cubic-bezier(0.74, 0.25, 0.76, 1);
  }

  10% {
    opacity: 0.7;
    animation-timing-function: cubic-bezier(0.12, 0.01, 0.08, 0.99);
  }

  to {
    opacity: 0.4;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes shimmer {
  0%,
  90%,
  to {
    background-position: calc(-100% - var(--shimmer-width)) 0;
  }

  30%,
  60% {
    background-position: calc(100% + var(--shimmer-width)) 0;
  }
}

@keyframes marquee {
  0% {
    transform: translate(0);
  }

  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}

@keyframes marquee-vertical {
  0% {
    transform: translateY(0);
  }

  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}
