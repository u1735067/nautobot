import { Tag } from "@nautobot/nautobot-ui";
import { Skeleton } from "@chakra-ui/react";
import { useGetRESTAPIQuery } from "@utils/api";
import { calculateLuminance } from "@utils/color";

export function ReferenceDataTag(props) {
    const { model_name, id } = props;
    const { data, isSuccess } = useGetRESTAPIQuery({
        app_name: "extras",
        model_name: model_name,
        uuid: id,
    });

    console.log(props);

    const display = data.display || data.label;

    return (
        <Skeleton isLoaded={isSuccess}>
            <Tag
                bg={"#" + data.color}
                color={
                    calculateLuminance(data.color) > 186 ? "#000000" : "#ffffff"
                }
                {...props}
            >
                {display}
            </Tag>
        </Skeleton>
    );
}

export default ReferenceDataTag;
