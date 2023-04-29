import { Tag } from "@nautobot/nautobot-ui";
import { useGetRESTAPIQuery } from "@utils/api";

export function ReferenceDataTag({ model_name, pk, size = "sm" }) {
    return (
        <Tag bg="#f00" size={size}>
            Test
        </Tag>
    );
}

export default ReferenceDataTag;
