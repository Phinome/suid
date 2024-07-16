import { Route } from "@solidjs/router";
import { Box, Container, useMediaQuery } from "@suid/material";
import { useTheme } from "@suid/material/styles";
import { SxPropsObject } from "@suid/system/sxProps";
import { EventParam } from "@suid/types";
import snakeCase from "@suid/utils/snakeCase";
import uncapitalize from "@suid/utils/uncapitalize";
import {
  Component,
  createMemo,
  JSXElement,
  lazy,
  Match,
  Show,
  Switch,
} from "solid-js";
import ErrorPage from "~/pages/ErrorPage";

export const Pages = Object.assign(
  import.meta.glob(`./pages/**/*Page/index.{ts,tsx}`),
  import.meta.glob(`./pages/**/*Page.{ts,tsx}`)
);

export function tryPreload(input: string | EventParam) {
  let href =
    typeof input === "string" ? input : input.target?.getAttribute("href");
  if (href?.startsWith("#")) href = href.slice(1);
  if (href) PageComponents[href]?.preload();
}

export const PageComponents = Object.keys(Pages).reduce(
  (result, localPath) => {
    const path = toPath(localPath);
    const Component = lazy(Pages[localPath] as any);
    result[path] = Component;
    return result;
  },
  {} as Record<string, ReturnType<typeof lazy>>
);

export function toPath(localPath: string) {
  const parts = localPath.slice(2).split("/").slice(1);
  let basename = parts[parts.length - 1];
  if (/^index\.tsx?$/.test(basename)) {
    parts.pop();
  }
  basename = parts.pop()!.replace(/(\.tsx?)?$/, "");
  const parentBaseName = parts[parts.length - 1];
  if (basename === parentBaseName) {
    parts.pop();
  }
  basename = uncapitalize(basename.replace(/Page$/, ""));
  return `/${[...parts, basename].map(snakeCase).join("/")}`;
}

export function RoutingElementContainer(props: {
  Component?: Component;
  children?: JSXElement;
  fullWidth?: boolean;
  sx?: SxPropsObject;
}) {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("md"));
  const sx = createMemo(
    () =>
      ({
        flexGrow: 1,
        p: 3,
        ...(props.sx || {}),
      }) as SxPropsObject
  );
  const children = createMemo(() => (
    <>
      {!!props.Component && <props.Component />}
      {props.children}
    </>
  ));
  return (
    <Show
      when={!props.fullWidth}
      fallback={
        <Box
          sx={{
            ...sx(),
            ...(!xs() && {
              px: 5,
            }),
          }}
          children={children()}
        />
      }
    >
      <Container maxWidth="lg" sx={sx()} children={children()} />
    </Show>
  );
}

export function Routing() {
  const Children = Object.entries(PageComponents).map(([path, Component]) => {
    return (
      <Route
        path={path === "/home" ? "/" : path}
        component={() => (
          <Switch fallback={<RoutingElementContainer Component={Component} />}>
            <Match when={path === "/tools/playground"}>
              <></>
            </Match>
            <Match when={path === "/tools/react-to-solid"}>
              <RoutingElementContainer fullWidth Component={Component} />
            </Match>
            <Match when={path === "/home"}>
              <Component />
            </Match>
          </Switch>
        )}
      />
    );
  });
  return (
    <>
      {Children.concat(
        <Route
          path="/*"
          component={() => (
            <RoutingElementContainer fullWidth>
              <ErrorPage title="Page not found." code="404" />
            </RoutingElementContainer>
          )}
        />
      )}
    </>
  );
}
