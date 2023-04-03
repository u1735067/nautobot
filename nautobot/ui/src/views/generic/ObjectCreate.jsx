import { useParams } from "react-router-dom";
import { Button, Frame, Text } from "@nautobot/nautobot-ui";
import { Card, CardHeader, CardBody } from "@chakra-ui/react"; // TODO import from nautobot-ui when available
import { useState, useCallback } from "react";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import useSWR from "swr";
import axios from "axios";

const fetcher = (url) =>
    axios
        .get(url + "create/", { withCredentials: true })
        .then((res) => res.data);

export default function GenericObjectCreateView({ list_url }) {
    const { app_name, model_name } = useParams();
    const [formData, setFormData] = useState(null);
    const { data, error } = useSWR(list_url, fetcher);

    if (!app_name || !model_name) {
        return <></>;
    }
    if (!list_url) {
        list_url = `/api/${app_name}/${model_name}/`;
    }

    if (error) return <div>Failed to load schema from {list_url}</div>;
    if (!data) return <></>;

    const post_schema = data.serializer.schema;
    // const ui_schema = data.serializer.uiSchema
    // const log = (type) => console.log.bind(console, type)
    const model_name_title = post_schema.title;

    // Using axios so that we can do a POST.
    const onSubmit = ({ formData }) =>
        axios({
            method: "post",
            url: list_url,
            data: formData,
            withCredentials: true,
            // TODO: obviously this can't ship with a hard-coded API token... see issue #3242
            headers: {
                "Content-Type": "application/json",
            },
        });

    return (
        <Frame>
            <Card>
                <CardHeader>
                    Add a new {model_name_title} "{list_url}"
                </CardHeader>
                <CardBody>
                    <Text>{model_name_title}</Text>
                    <Form
                        action={list_url}
                        method="post"
                        schema={post_schema}
                        validator={validator}
                        formData={formData}
                        onChange={(e) => setFormData(Object.assign(e.formData))}
                        onSubmit={onSubmit}
                    >
                        <Button type="submit">Create</Button>
                    </Form>
                </CardBody>
            </Card>
        </Frame>
    );
}
