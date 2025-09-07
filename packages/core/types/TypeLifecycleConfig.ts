export type TypeLifecycleConfig = {
  nextUrl: string;
  nextRoute: any;
  nextPathname: string;
  nextQuery?: any;
  nextSearch?: string;

  currentUrl?: string;
  currentQuery?: any;
  currentRoute?: any;
  currentSearch?: string;
  currentPathname?: string;
};
