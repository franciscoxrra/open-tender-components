import React from 'react'
import propTypes from 'prop-types'
import { Button } from './index'
import { isoToDate } from '@open-tender/js'

const InvalidItems = ({ invalidItems }) => {
  return invalidItems.length ? (
    <div className="validate__invalid">
      <p className="ot-font-size-small">
        The following items will need to be removed from your cart:
      </p>
      <ul>
        {invalidItems.map((item, index) => {
          const missingOptions =
            item.missingOptions && item.missingOptions.length
              ? item.missingOptions.map((option) => option.name).join(', ')
              : null
          return (
            <li key={`${item.id}-${index}`}>
              <span className="validate__invalid__item ot-bold">
                {item.name}
              </span>
              {missingOptions ? (
                <span className="ot-font-size-small">
                  {' '}
                  (unavailable modifiers: {missingOptions})
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  ) : null
}

InvalidItems.displayName = 'InvalidItems'
InvalidItems.propTypes = {
  invalidItems: propTypes.array,
}

const isCartRevertable = (previous, current, revenueCenters) => {
  if (!previous) return null
  const previousLocation = revenueCenters.find(
    (i) => i.revenue_center_id === previous.revenueCenterId
  )
  if (!previousLocation) return null
  const now = new Date()
  const requestedDate =
    current.requestedAt === 'asap' ? now : isoToDate(current.requestedAt)
  if (requestedDate < now) return null
  if (
    previous.revenueCenterId === current.revenueCenterId &&
    previous.serviceType === current.serviceType
  ) {
    return null
  }
  return { newLocation: previousLocation, newMenuVars: previous }
}

const CartErrors = ({
  errors,
  revert,
  revertIcon,
  proceed,
  proceedIcon,
  revenueCenters,
  previousMenuVars,
  menuVars,
}) => {
  const isRevertable = isCartRevertable(
    previousMenuVars,
    menuVars,
    revenueCenters
  )

  const handleRevert = (evt) => {
    const { newLocation, newMenuVars } = isRevertable
    revert(evt, newLocation, newMenuVars)
  }

  const unavailable = errors
    ? [...errors.missingItems, ...errors.invalidItems]
    : []

  return (
    <div className="validate">
      <InvalidItems invalidItems={unavailable} />
      <p>
        {isRevertable
          ? 'Please either remove these items or switch back to your previous menu.'
          : 'Please click the button below to remove these items and proceed with your order.'}
      </p>
      <div className="validate__buttons">
        {isRevertable && (
          <Button
            text="Back to Previous Menu"
            icon={revertIcon}
            onClick={handleRevert}
            classes="ot-btn"
          />
        )}
        <Button
          text="Remove Items"
          icon={proceedIcon}
          onClick={proceed}
          classes="ot-btn"
        />
      </div>
    </div>
  )
}

CartErrors.displayName = 'CartErrors'
CartErrors.propTypes = {
  errors: propTypes.object,
  revert: propTypes.func,
  revertIcon: propTypes.element,
  proceed: propTypes.func,
  proceedIcon: propTypes.element,
  revenueCenters: propTypes.array,
  previousMenuVars: propTypes.object,
  menuVars: propTypes.object,
}

export default CartErrors
