import { UserProvider } from "./UserContext";
import { ServerProvider } from "./ServerContext";
// Importe d'autres contextes ici si nécessaire

const AllProviders = ({ children }) => {
    return (
        <UserProvider>
            <ServerProvider>
                {children}
            </ServerProvider>
        </UserProvider>
    );
};

export default AllProviders;
