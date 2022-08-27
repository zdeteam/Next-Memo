import Index from "../pages/Home";
import Index from "../pages/Auth";

const appRouter = {
  "/auth": <Index />,
  "*": <Index />,
};

export default appRouter;
