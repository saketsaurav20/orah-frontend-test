import React, { useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void
  stateList: any
  setStateList: any
  filter: any
  setState: any
  state: any;
}
export const RollStateSwitcher: React.FC<Props> = ({ filter, setState,state, initialState = "unmark", size = 40, onStateChange, setStateList, stateList }) => {
  const [rollState, setRollState] = useState(state === "all" ? "unmark" : state)
  const [firstClick, setFirstClick] = useState(false)
  const nextState = () => {
    if (!firstClick) {
      setFirstClick(true)
    }
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    let next: any
    if (rollState === "unmark") {
      setStateList((prev: any) => {
        return { ...prev, present: stateList.present + 1 }
      })
      next = nextState()
      setRollState(next)
    } else if (rollState === "present") {
      setStateList((prev: any) => {
        return { ...prev, late: stateList.late + 1, present: stateList.present === 0 ? stateList.present : stateList.present - 1 }
      })
      next = nextState()
      setRollState(next)
    } else if (rollState === "late") {
      setStateList((prev: any) => {
        return { ...prev, absent: stateList.absent + 1, late: stateList.late - 1 }
      })
      next = nextState()
      setRollState(next)
    } else {
      setStateList((prev: any) => {
        return { ...prev, present: stateList.present + 1, absent: stateList.absent - 1 }
      })
      next = nextState()
      setRollState(next)
    }
    setState(next)
    if (onStateChange) {
      onStateChange(next)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
