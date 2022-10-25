import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person, SortStateType } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [studentData, setStudentData] = useState<{ students: Person[] } | undefined>({ students: [] })
  const [sortState, setSortState] = useState("")
  const [filter, setFilter] = useState("all")
  // def init state of the counter attendance
  const [stateList, setStateList] = useState({
    all: 0,
    present: 0,
    late: 0,
    absent: 0,
  })
  const nextState = () => {
    const states: SortStateType[] = ["incByFirstName", "incByLastName", "decByFirstName"]
    if (sortState === "") return states[0]
    const matchingIndex = states.findIndex((s) => s === sortState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }
  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {
    console.log(data)
    if (action === "roll") {
      setIsRollMode(true)
      console.log(data)
    } else {
      const next = nextState()
      //  console.log(nextState());
      setSortState(next)
      if (next === "incByFirstName") {
        data?.students.sort((a, b) => a.first_name.localeCompare(b.first_name))
        setStudentData(data)
      } else if (next === "incByLastName") {
        data?.students.sort((a, b) => a.last_name.localeCompare(b.last_name))
        setStudentData(data)
      } else if (next === "decByFirstName") {
        data?.students.sort((a, b) => a.last_name.localeCompare(b.last_name)).reverse()
        setStudentData(data)
      }
    }
  }

  const searchedData = (
    data:
      | {
          students: Person[]
        }
      | undefined
  ) => {
    console.log(data)
    setStudentData(data)
  }

  const onActiveRollAction = (action: ActiveRollAction, value?: string) => {
    if (action === "exit") {
      setIsRollMode(false)
    }else{
      value && setFilter(value)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} data={data} searchedData={searchedData} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {!(studentData?.students.length && loadState === "loaded") ? (
          data?.students && (
            <>
              {data.students.map((s) => (
                <StudentListTile stateList={stateList} filter={filter} setStateList={setStateList} key={s.id} isRollMode={isRollMode} student={s} />
              ))}
            </>
          )
        ) : (
          <>
            {studentData.students.map((s) => (
              <StudentListTile stateList={stateList}  filter={filter} setStateList={setStateList} key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}
        {/* {loadState === "loaded" && studentData && (
          <>
            {studentData.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )} */}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} stateList={stateList} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  data:
    | {
        students: Person[]
      }
    | undefined
  searchedData: (
    data:
      | {
          students: Person[]
        }
      | undefined
  ) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props
  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resData = props.data?.students?.filter((b) => b.first_name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1)
    console.log(resData)
    if (resData) props.searchedData({ students: resData })
  }
  const debounceFunc = (func: { (e: React.ChangeEvent<HTMLInputElement>): void; apply?: any }, delay: number | undefined) => {
    let timer: number | undefined
    return function (...args: any) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        // func(...args);
        func.apply(null, args)
        console.log(...args)
      }, delay)
    }
  }
  const optimizedDebounce = debounceFunc(onSearchInputChange, 500)
  return (
    <S.ToolbarContainer>
      <div onClick={() => onItemClick("sort")}>First Name</div>
      <div>
        <label htmlFor="search">Search</label>&nbsp;
        <input type="search" id="fname" name="fname" onChange={optimizedDebounce} />
      </div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
    cursor: pointer;
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
function data(data: any, arg1: { students: Person[] | undefined }) {
  throw new Error("Function not implemented.")
}
