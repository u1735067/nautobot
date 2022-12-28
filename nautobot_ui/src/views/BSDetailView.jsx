import Card from "react-bootstrap/Card"
import CardHeader from "react-bootstrap/CardHeader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faMinus, faXmark } from "@fortawesome/free-solid-svg-icons"
import { nautobot_url } from "../index"
import Tab from "react-bootstrap/Tab"
import Table from "react-bootstrap/Table"
import Tabs from "react-bootstrap/Tabs"
import { useParams } from "react-router-dom"
import useSWR from "swr"

const fetcher = (url) => fetch(url, { credentials: "include" }).then((res) => res.ok ? res.json() : null)
const fetcherHTML = (url) => fetch(url, { credentials: "include" }).then((res) => res.ok ? res.text() : null)

function render_value(value) {
  switch (typeof value) {
    case "object":
      return value === null ? <FontAwesomeIcon icon={faMinus} /> : Array.isArray(value) ? <ul></ul> : value["display"]
    case "boolean":
      return value ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faXmark} />
    default:
      return value === "" ? <FontAwesomeIcon icon={faMinus} /> : value
  }
}

function RenderRow(props) {
  var key = props.identifier;
  var value = props.value;

  if (["id", "url", "display", "slug", "notes_url"].includes(key) ^ !props.advanced) {
    return null;
  }

  if (key[0] === "_") return null

  // "foo_bar" --> "Foo Bar"
  key = key.split("_").map((x) => (x ? x[0].toUpperCase() + x.slice(1) : "")).join(" ");

  return (
    <tr>
      <td>{key}</td>
      <td>{render_value(value)}</td>
    </tr>
  );
}

export default function ObjectRetrieve({ api_url }) {

  const { app_name, model_name, object_id } = useParams()
  if (!!app_name && !!model_name && !!object_id && !api_url) {
    api_url = `${nautobot_url}/api/${app_name}/${model_name}/${object_id}/`
  }
  const { data: objectData, error } = useSWR(() => api_url, fetcher)
  const { data: pluginHTML } = useSWR(() => api_url ? api_url + "plugin_full_width_fragment/" : null, fetcherHTML)
  if (error) return <div>Failed to load {api_url}</div>
  if (!objectData) return <></>
  return (
    <>
      <h1>{objectData.name}</h1>
      <p>
        <small className="text-muted">
          {objectData.created &&
            <>Created {objectData.created} &middot; </>
          }
          <> Updated <span title={objectData.last_updated}>xyz seconds</span> ago</>
        </small>
      </p>
      <div className="pull-right noprint"></div>
      <Tabs defaultActiveKey="main">
        <Tab eventKey="main" title="Main">
          <br />
          <Card>
            <CardHeader>
              <strong>Main</strong>
            </CardHeader>
            <Table hover>
              <tbody>
                {Object.keys(objectData).map((key, idx) => <RenderRow identifier={key} value={objectData[key]} advanced key={idx} />)}
              </tbody>
            </Table>
          </Card>
          <br />
          <div dangerouslySetInnerHTML={{ __html: pluginHTML }} />
          <br />
        </Tab>
        <Tab eventKey="advanced" title="Advanced">
          <br />
          <Card>
            <CardHeader>
              <strong>Advanced</strong>
            </CardHeader>
            <Table hover>
              <tbody>
                {Object.keys(objectData).map((key, idx) => <RenderRow identifier={key} value={objectData[key]} advanced={false} key={idx} />)}
              </tbody>
            </Table>
          </Card>
        </Tab>
        <Tab eventKey="notes" title="Notes" />
        <Tab eventKey="change_log" title="Change Log">
          <br />
          <div dangerouslySetInnerHTML={{ __html: "<p>Your html code here.<p>" }} />
        </Tab>
      </Tabs>
    </>
  )
}
