import {
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Login, SignUp } from "@/pages/auth";
import { HomeUser } from "@/pages/home";
const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    title: "auth pages",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/Login",
        element: <Login />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
  {
    layout: "home",
    pages: [
      {
        name: "Home",
        path: "/homeUser",
        element: <HomeUser />,
      },
    ],
  },
];

export default routes;
