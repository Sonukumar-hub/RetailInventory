package com.stocksmart.service;

import com.stocksmart.dto.location.*;
import com.stocksmart.entity.Location;
import com.stocksmart.exception.*;
import com.stocksmart.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {
    private final LocationRepository locationRepository;

    @Transactional(readOnly = true)
    public Page<LocationResponse> getAll(Pageable pageable) {
        return locationRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<LocationResponse> getAllList() {
        return locationRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public LocationResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public LocationResponse create(LocationRequest req) {
        if (locationRepository.existsByName(req.name()))
            throw new BadRequestException("Location name already exists: " + req.name());
        Location l = Location.builder().name(req.name()).type(req.type())
                .address(req.address()).city(req.city()).state(req.state()).country(req.country())
                .build();
        return toResponse(locationRepository.save(l));
    }

    @Transactional
    public LocationResponse update(Long id, LocationRequest req) {
        Location l = findById(id);
        l.setName(req.name()); l.setType(req.type());
        l.setAddress(req.address()); l.setCity(req.city());
        l.setState(req.state()); l.setCountry(req.country());
        return toResponse(locationRepository.save(l));
    }

    @Transactional
    public void delete(Long id) {
        Location l = findById(id);
        l.setActive(false);
        locationRepository.save(l);
    }

    private Location findById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
    }

    private LocationResponse toResponse(Location l) {
        return new LocationResponse(l.getId(), l.getName(), l.getType(), l.getAddress(),
                l.getCity(), l.getState(), l.getCountry(), l.getActive(), l.getCreatedAt());
    }
}
