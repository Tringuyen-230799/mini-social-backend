export const handleExcludeRoute = (route: string, method: string): boolean => {
  const excludeRoute = [
    {
      path: "/api/posts",
      method: "GET",
    },
  ];

  return excludeRoute.some((p) => p.path.includes(route) && method == p.method);
};
