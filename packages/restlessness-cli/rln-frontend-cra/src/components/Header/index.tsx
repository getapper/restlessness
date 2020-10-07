import React, { memo } from "react";
import {
  AppBar,
  Breadcrumbs,
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import useHeader from "./index.hooks";

const Header = () => {
  const { links, currentPage } = useHeader();

  return (
    <AppBar>
      <Toolbar variant="dense">
        <Breadcrumbs aria-label="breadcrumb">
          {links.map((link) => (
            <Link color="inherit" href={link.href} key={link.href}>
              {link.page}
            </Link>
          ))}
          <Typography color="textPrimary">{currentPage}</Typography>
        </Breadcrumbs>
      </Toolbar>
    </AppBar>
  );
};

export default memo(Header);
