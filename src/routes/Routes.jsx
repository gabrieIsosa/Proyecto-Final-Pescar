import { useRoutes } from "react-router-dom";
import Layout from "../pages/Layout/Layout";
import Publications from "../pages/Publications/Publications";
import Upload from "../pages/Upload/upload";
import Index from "../pages/Index/Index";
import CreateEntrepreneur from "../pages/CreateEntrepreneur/CreateEntrepreneur";

export const Routes = () => {

    const routes = [
        {
            element: <Layout/>,
            children: [
                {
                    path: '/',
                    element: <Index/>
                },
                {
                    path: '/publicaciones',
                    element: <Publications/>
                },
                {
                    path: '/publicaciones/crearPublicacion',
                    element: <Upload/>
                },
                {
                    path: '/inicio',
                    element: <Index/>
                },
                {
                    path:'/emprendimientos/crearEmprendimiento',
                    element:<CreateEntrepreneur/>
                }
            ],
        }
    ]

    return useRoutes(routes);
}

