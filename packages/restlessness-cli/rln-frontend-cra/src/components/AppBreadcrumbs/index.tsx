import { Breadcrumbs, Link, Typography } from "@material-ui/core";
import React, { memo } from "react";

const AppBreadcrumbs = () => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link color="inherit" href="/">
        Dashboard
      </Link>
      <Link color="inherit" href="/getting-started/installation/">
        Endpoints
      </Link>
      <Typography color="textPrimary">Breadcrumb</Typography>
    </Breadcrumbs>
  );
};

export default memo(AppBreadcrumbs);
