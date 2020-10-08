import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { capitalize } from "@material-ui/core";

const useHeader = () => {
  const { hash } = useLocation();

  const links = useMemo(
    () =>
      hash
        .split("/")
        .splice(0, hash.split("/").length - 1)
        .map((path) => {
          switch (path) {
            case "#":
              return {
                href: "#/",
                page: "Dashboard",
              };
            case "endpoints":
              return {
                href: "#/endpoints",
                page: "Endpoints",
              };
            case "services":
              return {
                href: "#/services",
                page: "Services",
              };
            case "models":
              return {
                href: "#/models",
                page: "Models",
              };
            default:
              return {
                href: "#/",
                page: "not found",
              };
          }
        }),
    [hash]
  );

  const currentPage = useMemo(() => capitalize(hash.split("/").pop() ?? ""), [
    hash,
  ]);

  return {
    links,
    currentPage,
  };
};

export default useHeader;
